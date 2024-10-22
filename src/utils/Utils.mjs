import axios from "axios";
import {
  DebugOptions,
  MessageType,
  Permissions,
  WebhookMessageType,
} from "./Interfaces.mjs";
import { createLogger, format, transports } from "winston";
import JSONdb from "simple-json-db";
import { Collection, WebhookClient } from "discord.js";

class Utils {
  constructor(debug = false, allowList = [], kickList = [], rulesList = []) {
    this.debug = new Debug(debug); // Set Debug class
    this.kickList = kickList; // Set kickList
    this.refreshKickList(); // Turn on kickList refreshing
    this.rulesList = rulesList; // Set rulesList
    this.refreshRulesList(); // Turn on rulesList refreshing
    this.link = new Link(); // Set Link class
    this.discordReply = new DiscordReply(); // Set DiscordReply class
    this.webhookLogger = new WebhookLogger(); // Set WebhookLogger class
    this.discordAnsiCodes = discordAnsiCodes;
    this.chatSeparator =
      "-----------------------------------------------------";
    this.minMsgDelay = 550;
    (async () => {
      setInterval(() => {
        this.sendWebhookMessages();
      }, 5000);
    })();
  }

  setDebug(debug) {
    this.debug.debug = debug;
  }

  setPlayerNameDatabase(database) {
    /** @type {JSONdb}  */
    this.playerNamesDatabase = database;
  }

  setGeneralDatabase(database) {
    /** @type {JSONdb}  */
    this.generalDatabase = database;
  }

  /**
   *
   * @param {String} message
   * @param {"Info"|"Warn"|"Error"} type
   */
  log(message, type) {
    logger[type.toLowerCase()](message);
  }

  async getRulesList() {
    if (this.rulesList.length === 0)
      this.rulesList = await import(
        `../../data/bingoBrewersRules.json?cacheBust=${Date.now()}`,
        { with: { type: "json" } }
      );
    this.rulesList = this.rulesList.default;
    return this.rulesList;
  }

  refreshRulesList() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../../data/bingoBrewersRules.json?cacheBust=${Date.now()}`,
          {
            with: { type: "json" },
          }
        );
        this.rulesList = configModule.default; // Access the default export of the JSON module
        // DEBUG: console.log("Allowlist updated:", allowlist);
      } catch (error) {
        console.error("Error updating allowlist:", error);
      }
    }, 10000);
  }

  async getKickList() {
    if (this.kickList.length === 0) {
      this.kickList = await import(
        `../../data/autoKickWords.json?cacheBust=${Date.now()}`,
        { with: { type: "json" } }
      );
      this.kickList = this.kickList.default.autoKickWords;
    }
    return this.kickList;
  }

  refreshKickList() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../../data/autoKickWords.json?cacheBust=${Date.now()}`,
          {
            with: { type: "json" },
          }
        );
        this.kickList = configModule.default.autoKickWords; // Access the default export of the JSON module
      } catch (error) {
        console.error("Error updating kickList:", error);
      }
    }, 10000);
  }

  async updateAllFromUUID(bot) {
    const startTimestamp = Date.now();
    this.log("Started refreshing all stored usernames from UUID...", "Info");
    let fails = [];
    for (const user of this.playerNamesDatabase.get("data")) {
      fails.push(
        await this.updateUserFromUUID({ name: user.accounts[0].name }),
      );
    }
    // flatten array: `[[uuid1, uuid2], [], [uuid3]]` -> `[uuid1, uuid2, uuid3]`
    fails = fails.flat();
    const doneTimestamp = Date.now();
    const secondsElapsed =
      Math.round(doneTimestamp / 10 - startTimestamp / 10) / 100;
    if (fails.length < 1)
      this.log(
        `Successfully updated all usernames in ${secondsElapsed}s!`,
        "Info",
      );
    // a (partially) failed refresh is only a security risk (in theory), if the uuid in question hasn't been checked in 37 days (time for ign to be released after name change)
    // this means no retry before next scheduled execution is be necessary
    else
      this.log(
        `Encountered ${fails.length} issues while updating usernames (invalid UUID (somehow), or API issue). Time taken: ${secondsElapsed}s; failed UUIDs: ${fails.join(" ")}`,
        "Warn",
      );
    this.generalDatabase.set("lastUsernameRefresh", Date.now());
    this.scheduledUsernameRefresh = setTimeout(
      this.updateAllFromUUID.bind(this),
      bot.config.usernameRefreshInterval,
      bot,
    );
    return { timeTaken: secondsElapsed, failed: fails.length };
  }

  /** Get Minecraft player uuid from username */
  async getUUID(username, returnName = false) {
    try {
      let response = await axios.get(
        `https://api.mojang.com/users/profiles/minecraft/${username}`,
      );
      if (response.data.errorMessage) return null;
      // useful if, in addition to fetching the uuid, you also want to validate username capitalisation
      if (returnName)
        return { uuid: response.data.id, name: response.data.name };
      return response.data.id;
    } catch (e) {
      return null;
    }
  }

  /** Get Minecraft player username from uuid */
  async getUsername(uuid) {
    try {
      let data = await axios.get(
        `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
      );
      if (data.data.errorMessage) return null;
      return data.data.name;
    } catch (e) {
      return null;
    }
  }

  /**
   * @param {import("../mineflayer/Bot.mjs").default} bot
   * @param {string} commandAlias
   * @returns {Object|null}
   */
  getCommandByAlias(bot, commandAlias) {
    return bot.partyCommands.find((value, key) => key.includes(commandAlias));
  }

  /**
   * Retrieves a list of user accounts filtered by the specified permission
   * rank.
   *
   * @param {Permissions} rank - The rank from the Permissions enum by which to filter users.
   *
   * @returns {Array<Object>}
   * An array containing one or more objects that hold details for every
   * match to the given permission rank: Per actual player on record with that
   * permission, an object containing an array of all user accounts and other
   * related attributes. The structure per returned object (per actual player
   * with that rank) is as follows:
   * ```json
   * [
   *   {
   *     "accounts": [
   *       {
   *         "name": "string",
   *         "uuid": "string",
   *         "hypixelRank": "string|null"
   *       },
   *       {
   *        potential alt account(s)...
   *       }
   *     ],
   *     "permissionRank": 0-5,
   *     "preferredAccount": "string (uuid of preferred account)",
   *     "discord": "string"
   *   },
   *   next player object...
   * ]
   * ```
   */
  getUsersByPermissionRank(rank) {
    return this.playerNamesDatabase
      .get("data")
      .filter((x) => x.permissionRank === rank);
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @returns {Object|null}
   */
  getPermissionsByUser(options = {}) {
    if (!options || (!options.uuid && !options.name)) return null;

    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    return userObj.permissionRank;
  }

  /**
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @param {string} [options.discord]
   * @returns {Object|null}
   */
  getUserObject(options = {}) {
    if (!options || (!options.uuid && !options.name && !options.discord))
      return null;
    const uuid = options.uuid?.toLowerCase?.();
    const name = options.name?.toLowerCase?.();
    if (options.discord) {
      let data = this.playerNamesDatabase
        .get("data")
        .find((user) => user.discord == options.discord);
      if (!data) return null;
      return data;
    }
    return this.playerNamesDatabase
      .get("data")
      .find((user) =>
        user.accounts.some(
          (acc) =>
            (uuid && acc.uuid === uuid) ||
            (name && acc.name.toLowerCase() === name),
        ),
      );
  }

  /**
   *
   * @param {Object} options
   * @param {String} [options.uuid]
   * @param {String} [options.name]
   * @param {Number} [options.permissionRank]
   * @param {Number} [options.mainAccount]
   * @returns
   */
  addUser(options = {}) {
    if (
      !options ||
      !options.uuid ||
      !options.name ||
      !(options.permissionRank || options.mainAccount) ||
      this.getUserObject(options)
    )
      return null;
    let db = this.playerNamesDatabase.get("data");
    if (options.mainAccount) {
      // Add account as alt of `mainAccount`
      let userObj = this.getUserObject({ name: options.mainAccount });
      if (!userObj) return null;
      db[db.indexOf(userObj)].accounts.push({
        name: options.name,
        uuid: options.uuid,
      });
    }
    // Add entirely new player entry
    else
      db.push({
        accounts: [
          {
            name: options.name,
            uuid: options.uuid,
          },
        ],
        permissionRank: options.permissionRank,
      });
    this.playerNamesDatabase.set("data", db);
  }

  /**
   *
   * @param {Object} options
   * @param {String} [options.name]
   * @param {Boolean} [options.onlyThis]
   * @returns
   */
  removeUser(options = {}) {
    if (!options || !options.name) return null;
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    let db = this.playerNamesDatabase.get("data");
    if (options.onlyThis) {
      // Only remove this account, leave other alts intact
      userObj.accounts = userObj.accounts.filter(
        (acc) => acc.name.toLowerCase() !== options.name.toLowerCase(),
      );
      // reset preferredAccount if it's the removed account
      if (
        userObj.accounts.find((acc) => acc.name === options.name).uuid ===
        userObj.preferredAccount
      )
        delete userObj.preferredAccount;
      db[db.indexOf(userObj)] = userObj;
    }
    // Remove the entire user
    else db.splice(db.indexOf(userObj), 1);
    this.playerNamesDatabase.set("data", db);
  }

  /**
   * @param {Object} options
   * @param {String} [options.name]
   * @param {Boolean} [options.onlyThis]
   * @returns {Promise<Array<String>>} array of uuids that failed to update
   */
  async updateUserFromUUID(options = {}) {
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    let db = this.playerNamesDatabase.get("data");
    let fails = [];
    if (options.onlyThis) {
      // only update this account's username
      const index = userObj.accounts.findIndex(
        (acc) => acc.name.toLowerCase() === options.name.toLowerCase(),
      );
      const uuid = userObj.accounts[index].uuid;
      const username = await this.getUsername(userObj.accounts[index].uuid);
      if (!username) return [uuid];
      db[db.indexOf(userObj)].accounts[index].name = username;
    } else {
      // update all the user's accounts' usernames
      for (const acc of userObj.accounts) {
        // the rate limit for the endpoint used in `getUsername` seems to be exactly 1700/min, according to my tests
        const username = await this.getUsername(acc.uuid);
        if (!username) fails.push(acc.uuid);
        else acc.name = username;
        userObj.accounts[userObj.accounts.indexOf(acc)];
        // this delay isn't necessary for any rate limit, but probably makes sense anyway
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      db[db.indexOf(userObj)] = userObj;
    }
    this.playerNamesDatabase.set("data", db);
    return fails;
  }

  /**
   * @param {string} user1   sender.username
   * @param {string} user2   sender.username
   *
   * @returns {boolean} Returns true **iff** the player behind username 1 has
   * a strictly higher permission level than the entry behind username 2, i.e.,
   * returns true if #1 is allowed to kick/ban/etc. #2.
   *
   * @example
   * ```js
   * if (!bot.utils.isHigherRanked(sender.username, playerToBeAffected)) return;
   * ```
   */
  isHigherRanked(user1, user2) {
    // bot.utils.getPermissionsByUser({ name: sender.username })
    const result =
      this.getPermissionsByUser({ name: user1 }) >
      this.getPermissionsByUser({ name: user2 });
    return result;
  }

  /**
   * @param {Object} options
   * @param {String} [options.uuid]
   * @param {String} [options.name]
   * @param {Number} [options.permissionRank]
   */
  setPermissionRank(options = {}) {
    let userObj = this.getUserObject(options);
    if (
      !userObj ||
      !Object.values(Permissions).includes(options.permissionRank)
    )
      return null;
    let db = this.playerNamesDatabase.get("data");
    db[db.indexOf(userObj)].permissionRank = options.permissionRank;
    this.playerNamesDatabase.set("data", db);
  }

  /**
   * @param {Object} options
   * @param {String} [options.uuid]
   * @param {String} [options.name]
   * @param {String} [options.discord]
   * @param {String} [options.forceHideRank]
   * @returns {String|null}
   */
  getPreferredUsername(options = {}) {
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    // if preferredAccount is not defined, set it to the user's first account
    if (!userObj.preferredAccount) {
      this.setPreferredAccount({
        name: options.name,
        uuid: options.uuid,
        preferredAccount: userObj.accounts[0].uuid,
      });
    }
    const preferredAccount = userObj.accounts.find(
      (acc) => acc.uuid === userObj.preferredAccount,
    );
    let preferredName = "";
    if (
      !userObj.hideRank &&
      !options.forceHideRank &&
      preferredAccount.hypixelRank
    )
      preferredName += preferredAccount.hypixelRank + " ";
    preferredName += preferredAccount.name;
    return preferredName;
  }

  /**
   * @param {Object} options
   * @param {String} [options.uuid]
   * @param {String} [options.name]
   * @param {String} [options.preferredAccount]
   * @returns
   */
  setPreferredAccount(options = {}) {
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    let db = this.playerNamesDatabase.get("data");
    db[db.indexOf(userObj)].preferredAccount = options.preferredAccount;
    this.playerNamesDatabase.set("data", db);
  }

  /**
   * @param {Object} options
   * @param {String} [options.uuid]
   * @param {String} [options.name]
   * @param {String} [options.hideRank]
   * @returns
   */
  setHideRankSetting(options = {}) {
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    let db = this.playerNamesDatabase.get("data");
    db[db.indexOf(userObj)].hideRank = options.hideRank;
    this.playerNamesDatabase.set("data", db);
  }

  /**
   * Returns a random alphanumeric string.
   * Originally written by ooffyy.
   * @param {Number} length
   * @returns the random string
   */
  /* const */
  generateRandomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      let randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  };

  /**
   * Adds on a random string of characters to bypass if eligible.
   * Originally written by ooffyy.
   * @param {String} string string to append
   * @returns formatted/unformatted string
   */
  addRandomString(string) {
    // TODO: Potentially cap this to the maximum message length of like 256 and
    // accept/allow a *veeeery* long message to not go through.
    return (
      string +
      " |" +
      ` ${this.generateRandomString(
        string.length * 0.33 < 6 ? 6 : string.length * 0.33,
      )}`
    );
  }

  /**
   * @param {String} message
   * @returns {String}
   */
  replaceColorlessEmotes(message) {
    Object.keys(hypixelEmotes).forEach((emote) => {
      message = message.replaceAll(hypixelEmotes[emote], emote);
    });
    return message;
  }

  /**
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @param {string} [options.discordId]
   * @returns {Object|null}
   */
  setDiscord(options = {}) {
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    let db = this.playerNamesDatabase.get("data");
    db[db.indexOf(userObj)].discord = options.discordId;
    this.playerNamesDatabase.set("data", db);
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.link]
   * @param {string} [options.time]
   */
  setMonthGuide(options = {}) {
    let data = this.generalDatabase.get("monthGuide");
    if (!options.time)
      options.time = new Date().getMonth() + 1 + "/" + new Date().getFullYear();
    if (!data) data = {};
    if (
      data[new Date().getMonth() + "/" + new Date().getFullYear()] ===
      options.link
    )
      return;
    if (data[options.time] && data[options.time].overwrite) return;
    data[options.time] = {
      overwrite: options.overwrite || false,
      link: options.link,
    };
    this.generalDatabase.set("monthGuide", data);
  }
  /**
   *
   * @param {Object} options
   * @param {string} [options.time]
   * @returns {{overwrite: boolean, link: string}}
   */
  getMonthGuide(options = {}) {
    let data = this.generalDatabase.get("monthGuide");
    if (!data) data = {};
    if (!options.time)
      options.time = new Date().getMonth() + 1 + "/" + new Date().getFullYear();
    return data[options.time];
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   */
  getHypixelRank(options = {}) {
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    return userObj.accounts.find(
      (acc) =>
        (options.uuid && acc.uuid === options.uuid?.toLowerCase?.()) ||
        (options.name &&
          acc.name.toLowerCase() === options.name?.toLowerCase?.()),
    )?.hypixelRank;
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @param {string} [options.hypixelRank]
   */
  setHypixelRank(options = {}) {
    let userObj = this.getUserObject(options);
    if (!userObj) return null;
    let db = this.playerNamesDatabase.get("data");
    let account = userObj.accounts.find(
      (acc) =>
        (options.uuid &&
          acc.uuid.toLowerCase() === options.uuid.toLowerCase()) ||
        (options.name && acc.name.toLowerCase() === options.name.toLowerCase()),
    );
    account.hypixelRank = options.hypixelRank;
    db[db.indexOf(userObj)].accounts[userObj.accounts.indexOf(account)] =
      account;
    this.playerNamesDatabase.set("data", db);
  }

  /**
   *
   * @param {String} message
   * @returns {WebhookMessageType}
   */
  classifyMessage(message) {
    if (
      partyMemberEventRegex.test(message) ||
      partyMemberJoinedRegex.test(message) ||
      partyMemberLeftRegex.test(message)
    )
      return WebhookMessageType.JoinLeave;
    else if (privateMessageRegex.test(message))
      return WebhookMessageType.PrivateMessage;
    else if (publicMessageRegex.test(message))
      return WebhookMessageType.PublicMessage;
    else if (guildMessageRegex.test(message))
      return WebhookMessageType.GuildMessage;
    else if (partyMessageRegex.test(message))
      return WebhookMessageType.PartyMessage;
    else if (!bridgeBlacklistRegex.some((regex) => regex.test(message)))
      return WebhookMessageType.Bridge;
    else return WebhookMessageType.Other;
  }

  /**
   * Returns IGN of the inviting player, or null if no invite was found.
   *
   * @param {ChatMessage} message
   * @returns {String|null}
   */
  findValidPartyInvite(message) {
    // all clickable segments in the invite message have the same clickEvent, so we only care about the first one
    const inviteIGN = message.extra
      ?.find((obj) => obj.clickEvent?.value?.startsWith("/party accept "))
      ?.clickEvent?.value?.slice(14);
    if (
      inviteIGN &&
      (this.getPermissionsByUser({ name: inviteIGN }) ??
        Permissions.ExSplasher) >= Permissions.Splasher
    ) {
      return inviteIGN;
    } else {
      return null;
    }
  }

  sendWebhookMessages() {
    this.webhookLogger.webhooks.forEach(async (type, url) => {
      const messages = this.webhookLogger.getMessages(type);
      if (messages.length < 1) return;
      let toSend;
      if (type === WebhookMessageType.ActionLog) toSend = messages.join("\n");
      else toSend = `\`\`\`ansi\n${messages.join("\n")}\`\`\``;
      try {
        let discWebhook = new WebhookClient({ url: url });
        await discWebhook.send(toSend);
      } catch (e) {
        if (this.webhookLogger.invalidWebhooks.has(url)) return;
        this.log(
          `Error sending message to one of the webhooks, please check the URL.`,
          "error",
        );
        this.webhookLogger.setInvalidWebhook(url);
      }
    });
    // clear message queue after sending
    this.webhookLogger.messageQueue = [];
  }
}

const logger = createLogger({
  level: "debug",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      stderrLevels: ["error"],
    }),
  ],
});

class Debug {
  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   *
   * @param {Array} allowList The list of people
   * @param {DebugOptions} options Options for the debugging
   * @returns
   */
  printAllowList(allowList, options = DebugOptions) {
    if (!this.debug) return;
    if (options.printAll)
      console.log(
        allowList
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`,
          )
          .join("\n"),
      );
    if (options.printLength) console.log(allowList.length);
    if (options.printFirst) console.log(allowList[0]);
    if (options.printLast) console.log(allowList[allowList.length - 1]);
    if (options.printRank)
      console.log(
        allowList
          .filter((x) => x.permissionRank === options.printRank)
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`,
          )
          .join("\n"),
      );
    if (options.printUser)
      console.log(
        allowList
          .filter((x) => x.uuids.includes(options.printUser))
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`,
          )
          .join("\n"),
      );
  }

  /**
   *
   * @param {String} message
   * @param {"Info"|"Warn"|"Error"} type
   */
  log(message) {
    if (this.debug) {
      logger.debug(message);
    }
  }
}

class Link {
  constructor() {
    this.collection = new Collection();
  }

  addCode(id) {
    let code = utils.generateRandomString(6);
    this.collection.set(code, {
      id: id,
      verified: false,
    });
    return code;
  }

  removeCode(code) {
    this.collection.delete(code);
  }

  getId(code) {
    return this.collection.get(code);
  }

  setId(code, data) {
    this.collection.set(code, data);
  }
}

class DiscordReply {
  constructor() {
    this.collection = new Collection();
  }

  addReply(id) {
    let code = utils.generateRandomString(6);
    this.collection.set(code, {
      id: id,
      verified: false,
    });
    return code;
  }

  removeReply(code) {
    this.collection.delete(code);
  }

  getReply(code) {
    return this.collection.get(code);
  }

  setReply(code, data) {
    this.collection.set(code, data);
  }
}

class WebhookLogger {
  constructor() {
    this.webhooks = new Collection();
    this.invalidWebhooks = new Collection();
    this.messageQueue = [];
  }

  addMessage(message, messageType, allowBackticks = false) {
    if (!allowBackticks)
      // Escape potential injections that could ping users etc. on Discord by
      // escaping all ` (backticks) with ‵ ("reversed prime", U+2035)
      message = message.replace(/`/g, "‵");
    this.messageQueue.push({ message: message, type: messageType });
  }

  setInvalidWebhook(url) {
    this.invalidWebhooks.set(url, true);
  }

  /**
   *
   * @param {Array<{webhookUrl: String, messageType: WebhookMessageType}>} webhooks - An array of webhook objects.
   */
  async setWebhooks(webhooks) {
    this.webhooks.clear();
    webhooks.forEach((x) => {
      this.webhooks.set(x.webhookUrl, x.messageType);
    });
    return this.webhooks;
  }

  /**
   *
   * @param {WebhookMessageType} [messageType]
   */
  getMessages(messageType) {
    let messages = [];
    if (messageType === WebhookMessageType.All) messages = this.messageQueue;
    else if (messageType === WebhookMessageType.Bridge)
      messages = this.messageQueue.filter((msg) =>
        [
          WebhookMessageType.JoinLeave,
          WebhookMessageType.PrivateMessage,
          WebhookMessageType.PartyMessage,
          WebhookMessageType.Bridge,
        ].includes(msg.type),
      );
    else messages = this.messageQueue.filter((msg) => msg.type === messageType);
    return messages.map((msg) => msg.message);
  }
}

const privateMessageRegex = /^From |^To /;

const partyMessageRegex = /^Party > /;

const guildMessageRegex = /^Guild > /;

const publicMessageRegex = /^(\[.+\] )?\w+: /;

// seperate join/leave regex for future #status party member tracking
const partyMemberEventRegex =
  /^(?:\[.+\] )?(\w+) (?:has disconnected, they have 5 minutes to rejoin before they are removed from the party\.)$/;
const partyMemberJoinedRegex = /^(?:\[.+\] )?(\w+) (?:joined the party\.)$/;
const partyMemberLeftRegex =
  /^(?:(?:\[.+\] )?(\w+)|Kicked (.+)) (?:has left the party\.|was removed from your party because they disconnected\.|has been removed from the party\.|because they were offline\.)$/;

// stored as array for clarity
const bridgeBlacklistRegex = Object.freeze([
  /^Friend > /,
  /^You tipped \d+ players? in \d+ (different )?games?!$/,
  /^-+$/,
  /^ *$/,
  /^[WATCHDOG ANNOUNCEMENT]$/,
  /^Watchdog has banned [\d,]+ players in the last 7 days\.$/,
  /^Staff have banned an additional [\d,]+ in the last 7 days\.$/,
  /^Blacklisted modifications are a bannable offense!$/,
  /^You have \d+ (voicemail\(s\)|unclaimed (leveling|achievement) rewards?)!$/,
  /^Click here to (read|view) (them|it)!$/,
  /^\/limbo for more information\.$/,
  /^ >>> \[MVP\+\+\] \w+ [a-z ]+ the lobby! <<<$/,
  /^\[MVP\+\] \w+ [a-z ]+ the lobby!$/,
]);

// currently unused alternative to blacklist, needs rewrite (any message containing the strings is matched)
const bridgeWhitelistRegex =
  /(You cannot say the same message twice!|Connected to|Bot kicked!|Bot disconnected.|You have joined|The party is now|The party is no longer|has promoted|has demoted|is now a Party Moderator|The party was transferred|disbanded|You are not allowed to disband this party.|Party Members|Party Leader|Party Moderators|You have been kicked from the party by|You are not in a party right now.|You are not currently in a party.|That player is not online!|Created a public party! Players can join with \/party join|Party is capped at|Party Poll|Invalid usage!|created a poll! Answer it below by clicking on an option|Question:|The poll|You cannot invite that player since they're not online.|You are not allowed to invite players.|enabled All Invite|to the party! They have 60 seconds to accept.|is already in the party.|You'll be partying with:)/;

const discordAnsiCodes = {
  "§0": "\u001b[30m",
  "§1": "\u001b[34m",
  "§2": "\u001b[32m",
  "§3": "\u001b[36m",
  "§4": "\u001b[31m",
  "§5": "\u001b[35m",
  "§6": "\u001b[33m",
  "§7": "\u001b[37m",
  "§8": "\u001b[30m",
  "§9": "\u001b[34m",
  "§a": "\u001b[32m",
  "§b": "\u001b[36m",
  "§c": "\u001b[31m",
  "§d": "\u001b[35m",
  "§e": "\u001b[33m",
  "§f": "\u001b[37m",
  "§l": "\u001b[1m",
  "§o": "\u001b[3m",
  "§n": "\u001b[4m",
  "§m": "\u001b[9m",
  "§k": "\u001b[6m",
  "§r": "\u001b[0m",
};

const hypixelEmotes = {
  "<3": "❤",
  ":star:": "✮",
  ":yes:": "✔",
  ":no:": "✖",
  ":java:": "☕",
  ":arrow:": "➜",
  ":shrug:": "¯\\_(ツ)_/¯",
  ":tableflip:": "(╯°□°）╯︵ ┻━┻",
  "o/": "( ﾟ◡ﾟ)/",
  ":123:": "123",
  ":totem:": "☉_☉",
  ":typing:": "✎...",
  ":maths:": "√(π+x)=L",
  ":snail:": "@'-'",
  ":thinking:": "(0.o?)",
  ":gimme:": "༼つ◕_◕༽つ",
  ":wizard:": "('-')⊃━☆ﾟ.*･｡ﾟ",
  ":pvp:": "⚔",
  ":peace:": "✌",
  ":oof:": "OOF",
  ":puffer:": "<('O')>",
};

// class to replace (and emulate parts of) mineflayer's ChatMessage for custom console/discord messages or commands
class CustomMessage {
  constructor(message, isDiscord = false, discordReplyId = null) {
    this.self = true;
    this.ansiMessage = message;
    this.isDiscord = isDiscord;
    this.discordReplyId = discordReplyId;
  }

  toString() {
    return this.ansiMessage.replace(/\[\d+m/g, "");
  }

  toAnsi() {
    return this.ansiMessage;
  }
}

export default {
  extractUsername: function (message) {
    return message.match(/^(Party >|From)( \[.+\])? (\w+): .+$/)?.[3];
  },

  extractHypixelRank: function (message) {
    return message.match(/^(Party >|From)( \[.+\])? (\w+): .+$/)?.[2]?.trim();
  },

  // removeRank: function (name) {
  //   return name.replace(/\[.+]/g, "").trim();
  // },

  determineMessageType: function (parsedMsgObj) {
    if (isWhisper(parsedMsgObj)) return MessageType.Whisper;
    else if (isPartyInvite(parsedMsgObj).isPartyInvite)
      return MessageType.PartyInvite;
    else if (isPartyMessage(parsedMsgObj)) return MessageType.PartyMessage;
    else return MessageType.Other;
  },

  stripColorCodes: function (str) {
    return str.replace(/§[0-9a-fk-or]/g, ""); //DuckDuckBang gave this
  },

  capitalizeFirstLetter: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  },

  CustomMessage: CustomMessage,
};

let utils = new Utils(
  true,
  // import("../data/playerNames.json", { with: { type: "json" } }),
  null,
  import("../../data/autoKickWords.json", {
    with: { type: "json" },
  }).autoKickWords,
  import("../../data/bingoBrewersRules.json", { with: { type: "json" } }),
);

export { utils };
