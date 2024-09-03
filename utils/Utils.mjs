import axios from "axios";
import { DebugOptions, MessageType } from "./Interfaces.mjs";
import { createLogger, format, transports } from "winston";

export class UtilClass {
  constructor(debug = false, allowList = [], kickList = [], rulesList = []) {
    this.debug = new Debug(debug); // Set Debug class
    this.StringSet = StringSet; // Set StringSet class
    this.allowList = allowList; // Set allowList
    this.refreshAllowList(); // Turn on allowList refreshing
    this.kickList = kickList; // Set kickList
    this.refreshKickList(); // Turn on kickList refreshing
    this.rulesList = rulesList; // Set rulesList
    this.refreshRulesList(); // Turn on rulesList refreshing
  }

  /**
   *
   * @param {String} message
   * @param {"Info"|"Warn"|"Error"} type
   */
  log(message, type) {
    logger[type.toLowerCase()](message);
  }

  // Used to fetch allowList anywhere in the code
  async getAllowList() {
    if (this.allowList.length === 0)
      this.allowList = await import(
        `../data/playerNames.json?cacheBust=${Date.now()}`,
        { assert: { type: "json" } }
      );
    this.allowList = this.allowList.default;
    return this.allowList;
  }

  // Used to refresh allowList every 10 seconds
  refreshAllowList() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../data/playerNames.json?cacheBust=${Date.now()}`,
          {
            assert: { type: "json" },
          }
        );
        this.allowList = configModule.default; // Access the default export of the JSON module
        // DEBUG: console.log("Allowlist updated:", allowlist);
      } catch (error) {
        console.error("Error updating allowlist:", error);
      }
    }, 10000);
  }

  async getRulesList() {
    if (this.rulesList.length === 0)
      this.rulesList = await import(
        `../data/bingoBrewersRules.json?cacheBust=${Date.now()}`,
        { assert: { type: "json" } }
      );
    this.rulesList = this.rulesList.default;
    return this.rulesList;
  }

  // Used to refresh allowList every 10 seconds
  refreshRulesList() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../data/bingoBrewersRules.json?cacheBust=${Date.now()}`,
          {
            assert: { type: "json" },
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
        `../data/autoKickWords.json?cacheBust=${Date.now()}`,
        { assert: { type: "json" } }
      );
    this.kickList = this.kickList.default;
    return this.kickList;
  }

  // Used to refresh allowList every 10 seconds
  refreshKickList() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../data/autoKickWords.json?cacheBust=${Date.now()}`,
          {
            assert: { type: "json" },
          }
        );
        this.kickList = configModule.default.autoKickWords; // Access the default export of the JSON module
        // DEBUG: console.log("Allowlist updated:", allowlist);
      } catch (error) {
        console.error("Error updating allowlist:", error);
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
    return this.allowList.filter((x) => x.permissionRank === rank);
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @returns {Object|null}
   */
  getPermissionsByUser(options = {}) {
    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    let processed = this.allowList.find((x) =>
      x.accounts.some(
        (y) =>
          y.uuid.toLowerCase() == options.uuid ||
          y.name.toLowerCase() == options.name
      )
    );
    if (processed) return processed.permissionRank;
    else return null;
  }

  /**
   * Use this to replace getHypixelRankByName
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @returns {Object|null}
   */
  getUserObject(options = {}) {
    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    return this.allowList.find((x) =>
      x.accounts.some(
        (y) =>
          y.uuid.toLowerCase() == options.uuid ||
          y.name.toLowerCase() == options.name
      )
    );
  }
}

const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
      stderrLevels: ['error']
    })
  ]
})

class StringSet {
  constructor() {
    this.set = new Set();
  }

  add(str) {
    if (typeof str === "string") {
      this.set.add(str);
    } else {
      err("Only strings can be added");
    }
  }

  addMultiple(arr) {
    if (Array.isArray(arr)) {
      arr.forEach((item) => {
        if (typeof item === "string") {
          this.add(item);
        } else {
          logDebug(`Skipping non-string value: ${item}`);
        }
      });
    } else {
      throw new Error("Argument must be an array");
    }
  }

  remove(str) {
    if (this.set.has(str)) {
      this.set.delete(str);
      return true;
    } else {
      return false; // Not found
    }
  }

  removeMultiple(arr) {
    if (Array.isArray(arr)) {
      arr.forEach((item) => {
        if (typeof item === "string") {
          if (!this.remove(item)) {
            logDebug(`Item not found in set: ${item}`);
          }
        } else {
          logDebug(`Skipping non-string value: ${item}`);
        }
      });
    } else {
      throw new Error("Argument must be an array");
    }
  }

  removeAllEntries() {
    return this.set.clear();
  }

  has(str) {
    return this.set.has(str);
  }

  // Get all strings as array for debugging/other purposes
  getAllEntries() {
    return Array.from(this.set);
  }
}

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
          .filter((x) => x.permissionRank === options.printRank)
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`
          )
          .join("\n")
      );
    if (options.printUser)
      console.log(
        allowList
          .filter((x) => x.uuids.includes(options.printUser))
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
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

const messageRegex =
  /^(?:Party >|From) ?(?:(\[.*?\]) )?(\w{1,16}): (.*?)(?:§.*)?$/s;

export default {
  // helper function to remove rank and Minecraft formatting from a username
  // taken & adapted from https://www.chattriggers.com/modules/v/HypixelUtilities (and old utils)
  removeRank: function(name) {
    return name.replace(/\[.+]/g, "").trim();
  },

  determineMessageType: function(parsedMsgObj) {
    if (isWhisper(parsedMsgObj)) return MessageType.Whisper;
    else if (isPartyInvite(parsedMsgObj).isPartyInvite) return MessageType.PartyInvite;
    else if (isPartyMessage(parsedMsgObj)) return MessageType.PartyMessage;
    else return MessageType.Other;
  },

  parseMessage: function(msg) {
    const match = msg.match(messageRegex);
    // If regex not matched, return nothing
    if (!match) return [null, null, null];
    // Sets all the other stuff
    const [, rank = "", playerName, msgContent] = match;

    if (determineMessageType(msg) != MessageType.Other) {
      // TODO: remove temporary solution (this determineMessageType() call) which
      // prevents log spamminess – after the debug "verbosity" levels have been added
      logDebug(
        "rank, senderName, msgContent: '" +
          rank +
          "', '" +
          playerName +
          "', '" +
          msgContent +
          "'",
      );
    }

    return { rank, playerName, msgContent };
  },

  stripColorCodes: function(str) {
    return str.replace(/§[0-9a-fk-or]/g, ""); //DuckDuckBang gave this
  },

  /**
   * Copy pasta from old since I didn't wanna read it :sob:
   * @param  {...any} argsToCheck
   * @returns
   */
  parseStdinArgs: function(...argsToCheck) {
    if (argsToCheck == null || argsToCheck.length === 0) {
      //return result;
      return new Map();
    }

    /*
    // maybe todo: interesting approach
    const result = (args) => {
      let map = new Map();

      args.forEach((key) => {
        map.set(key, null);
      });

      return map;
    };
    */

    // Get command line arguments from initial program start, or the running stdin
    const args = argsToCheck || process.argv.slice(2);

    // Loop through arguments and process them
    // Remove elements checked so as to not have O(n**2) every time
    while (argsToCheck.length > 0) {
      /* do stuff… */
      const arg = argsToCheck[0];

      // Check if the argument is a flag
      if (arg.indexOf("-") === 0) {
        // := .startsWith('-')
        switch (arg) {
          case "-t":
          // fallthrough for alias
          case "--test":
            log("Parsed no-op option 'test' (-t/--test) successfully!");
            break;
          case "-d":
          // fallthrough for alias
          case "--debug":
          // fallthrough for alias
          case "--debug-level":
            // toggle the debug output flag
            debugOutputEnabled[0] = !debugOutputEnabled[0];
            log(`Output debugging flag set to '${debugOutputEnabled[0]}'`);
            break;
          case "-b":
          // fallthrough for alias
          case "--bridge":
          // fallthrough for alias
          case "--discord-bridge":
            // toggle sending (receiving? in the future…) messages with Discord
            bridgingToDiscordEnabled[0] = !bridgingToDiscordEnabled[0];
            log(
              `Sending messages to Discord flag set to '${bridgingToDiscordEnabled[0]}'`
            );
            break;
          case "-r":
          // fallthrough for alias
          case "--reload":
          // fallthrough for alias
          case "--reload-data":
            // Process the flag
            /* TODO: add data reloading feature (for not having to do a full restart after the json files have been written to; needs appropriate interfacing functions in manageData.mjs first) */
            break;
          case "-h":
          // fallthrough for alias
          case "--help":
            console.log("Usage: node app.js [options]");
            console.log("Options:");
            console.log("-h, --help                   Display help message");
            console.log(
              "-d, --debug, --debug-level   Set debug output verbosity"
            );
            console.log(
              "-r, --reload, --reload-data  Reload JSON data (allowlist, banlist, rules)"
            );
            break;
          // Add more options here
          default:
            log(`Unknown option: ${arg}`);
            break;
        }
      } else {
        // Process the argument value
        // TODO: the debug-level option should be able to receive an int value
        log(`Argument value: ${arg}`);
      }

      //argsToCheck.splice(0,1);
      argsToCheck.shift();
    }

    // TODO: old?
    /*
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        // do stuff…
    }
    */
  }
}
