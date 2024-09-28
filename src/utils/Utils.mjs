import axios from "axios";
import {
  DebugOptions,
  MessageType,
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
    this.webhookLogger = new WebhookLogger(); // Set WebhookLogger class
    this.discordAnsiCodes = discordAnsiCodes;
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
    if (this.kickList.length === 0)
      this.kickList = await import(
        `../../data/autoKickWords.json?cacheBust=${Date.now()}`,
        { with: { type: "json" } }
      );
    this.kickList = this.kickList.default;
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

  // Get uuid from username
  async getUUID(username) {
    let data = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${username}`
    );
    if (data.data.errorMessage) return null;
    return data.data.id;
  }

  // Get username from uuid
  async getUsername(uuid) {
    let data = await axios.get(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
    );
    if (data.data.errorMessage) return null;
    return data.data.name;
  }

  getUsersByPermissionRank(rank) {
    return this.playerNamesDatabase
      .get("data")
      .filter(x => x.permissionRank === rank);
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @returns {Object|null}
   */
  getPermissionsByUser(options = {}) {
    if (!options || (!options.uuid && !options.name)) {
      throw new Error(
        "Invalid options: 'uuid' or 'name' must be provided for permissions check."
      );
    }

    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    let processed = this.playerNamesDatabase
      .get("data")
      .find(x =>
        x.accounts.some(
          y =>
            (options.uuid && y.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name && y.name.toLowerCase() == options.name)
        )
      );
    if (!processed) return null;
    return processed.permissionRank;
  }

  /**
   * Use this to replace getHypixelRankByName
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @param {string} [options.discord]
   * @returns {Object|null}
   */
  getUserObject(options = {}) {
    if (!options || (!options.uuid && !options.name && !options.discord)) {
      throw new Error(
        "Invalid options: 'uuid' or 'name' must be provided to get user info."
      );
    }

    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    if (options.discord) options.discord = options.discord.toLowerCase();
    return this.playerNamesDatabase
      .get("data")
      .find(x =>
        x.accounts.some(
          y =>
            (options.uuid && y.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name && y.name.toLowerCase() == options.name) ||
            (options.discord &&
              y.discord &&
              y.discord.toLowerCase() == options.discord)
        )
      );
  }

  /**
   * Use this to replace getHypixelRankByName
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @returns {Object|null}
   */
  getPreferredUsername(options = {}) {
    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    let data = this.playerNamesDatabase
      .get("data")
      .find(x =>
        x.accounts.some(
          y =>
            (options.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name.toLowerCase() == options.name)
        )
      );
    if (!data) return null;
    if (!data.preferredName) {
      let getData = this.playerNamesDatabase.get("data");
      getData[getData.indexOf(data)].preferredName = data.accounts[0].name;
      this.playerNamesDatabase.set("data", getData);
      return data.accounts[0].name;
    }
    return data.preferredName;
  }
  /**
   * Use this to replace getHypixelRankByName
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @param {string} [options.newName]
   * @returns {Object|null}
   */
  setPreferredUsername(options = {}) {
    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    let data = this.playerNamesDatabase
      .get("data")
      .find(x =>
        x.accounts.some(
          y =>
            (options.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name.toLowerCase() == options.name)
        )
      );
    if (!data) return null;
    let getData = this.playerNamesDatabase.get("data");
    getData[getData.indexOf(data)].preferredName = options.newName;
    this.playerNamesDatabase.set("data", getData);
  }

  /**
   * Returns a random alphanumeric string.
   * Originally written by ooffyy.
   * @param {Number} length
   * @returns the random string
   */
  /* const */
  generateRandomString = length => {
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
      ` ${this.generateRandomString(
        string.length * 0.33 < 6 ? 6 : string.length * 0.33
      )}`
    );
  }

  /**
   * Use this to replace getHypixelRankByName
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @param {string} [options.discordId]
   * @returns {Object|null}
   */
  setDiscord(options = {}) {
    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    let data = this.playerNamesDatabase
      .get("data")
      .find(x =>
        x.accounts.some(
          y =>
            (options.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name.toLowerCase() == options.name)
        )
      );
    let getData = this.playerNamesDatabase.get("data");
    getData[getData.indexOf(data)].discord = options.discordId;
    this.playerNamesDatabase.set("data", getData);
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
   * @param {string} [options.rank]
   */
  setUserRank(options = {}) {
    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    let data = this.playerNamesDatabase
      .get("data")
      .find(x =>
        x.accounts.some(
          y =>
            (options.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name.toLowerCase() == options.name)
        )
      );
    if (!data) return null;
    let getData = this.playerNamesDatabase.get("data");
    getData[getData.indexOf(data)].hypixelRank = options.rank;
    this.playerNamesDatabase.set("data", getData);
  }

  /**
   *
   * @param {String} message
   * @returns {WebhookMessageType}
   */
  classifyMessage(message) {
    if (partyMemberEventRegex.test(message))
      return WebhookMessageType.JoinLeave;
    else if (
      partyMemberKickedRegex.test(message) ||
      partyMemberEventRegex.test(message)
    )
      return WebhookMessageType.PartyMessage;
    else if (/^(From )/.test(message) || /^(To )/)
      return WebhookMessageType.PrivateMessage;
    // else if () PUBLI STUFF
    else if (/^(Guild >)/.test(message)) return WebhookMessageType.GuildMessage;
    else return WebhookMessageType.Other;
  }

  /**
   *
   * @param {String} message
   * @param {WebhookMessageType} messageType
   */
  sendWebhookMessage(message, messageType) {
    let webhooks = this.webhookLogger.getWebhooks({ messageType: messageType });
    webhooks.forEach(async (value, key) => {
      try {
        let discWebhook = new WebhookClient({ url: key });
        await discWebhook.send(`\`\`\`ansi\n${message}\`\`\``);
      } catch (e) {
        this.log(
          `Error sending one of the webhooks a message, please check the URL.`,
          "error"
        );
      }
    });
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
            x =>
              `Player UUIDs: ${x.accounts
                .map(y => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`
          )
          .join("\n")
      );
    if (options.printLength) console.log(allowList.length);
    if (options.printFirst) console.log(allowList[0]);
    if (options.printLast) console.log(allowList[allowList.length - 1]);
    if (options.printRank)
      console.log(
        allowList
          .filter(x => x.permissionRank === options.printRank)
          .map(
            x =>
              `Player UUIDs: ${x.accounts
                .map(y => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`
          )
          .join("\n")
      );
    if (options.printUser)
      console.log(
        allowList
          .filter(x => x.uuids.includes(options.printUser))
          .map(
            x =>
              `Player UUIDs: ${x.accounts
                .map(y => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`
          )
          .join("\n")
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

class WebhookLogger {
  constructor() {
    this.webhooks = new Collection();
  }

  /**
   *
   * @param {Array<{webhookUrl: String, messageType: WebhookMessageType}>} webhooks - An array of webhook objects.
   */
  async setWebhooks(webhooks) {
    this.webhooks.clear();
    webhooks.forEach(x => {
      this.webhooks.set(x.webhookUrl, x.messageType);
    });
    return this.webhooks;
  }

  /**
   *
   * @param {Object} options
   * @param {String} [options.webhookUrl] - The URL of the webhook.
   * @param {WebhookMessageType} [options.messageType] - The type of message to send to the webhook.
   */
  getWebhooks(options = {}) {
    if (options.webhookUrl) return this.webhooks.get(options.webhookUrl);
    else if (options.messageType)
      return this.webhooks.filter(
        x => x === options.messageType || x === WebhookMessageType.All
      );
    else return this.webhooks;
  }
}

const messageRegex =
  /^(?:Party >|From) ?(?:(\[.*?\]) )?(\w{1,16}): (.*?)(?:§.*)?$/s;

const partyMessageRegex = /^(Party >)/;

const bridgeMessageRegex =
  /(You cannot say the same message twice!|Connected to|Bot kicked!|Bot disconnected.|You have joined|The party is now|The party is no longer|has promoted|has demoted|is now a Party Moderator|The party was transferred|disbanded|You are not allowed to disband this party.|Party Members|Party Leader|Party Moderators|You have been kicked from the party by|You are not in a party right now.|You are not currently in a party.|That player is not online!|Created a public party! Players can join with \/party join|Party is capped at|Party Poll|Invalid usage!|created a poll! Answer it below by clicking on an option|Question:|The poll|You cannot invite that player since they're not online.|You are not allowed to invite players.|enabled All Invite|to the party! They have 60 seconds to accept.|is already in the party.|You'll be partying with:)/;
const partyMemberEventRegex =
  /(left the party.|joined the party.|disconnected, they have 5 minutes to rejoin before they are removed from the party.|was removed from your party because they disconn)/;
const partyMemberKickedRegex = /(has been removed from the party.)/;

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

export default {
  removeRank: function (name) {
    return name.replace(/\[.+]/g, "").trim();
  },

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
};

let utils = new Utils(
  true,
  // import("../data/playerNames.json", { with: { type: "json" } }),
  null,
  import("../../data/autoKickWords.json", { with: { type: "json" } }),
  import("../../data/bingoBrewersRules.json", { with: { type: "json" } })
);

export { utils };
