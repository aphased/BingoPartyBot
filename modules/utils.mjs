import chalk from "chalk";

import { debugOutputEnabled } from "../index.mjs";

export { logDebug, log, err, parseStdinArgs };
export { removeFormatting, removeRank };
export { printAllowlist, getNameByPermissionRank, getHypixelRankByName };
// export { containsInNestedArray };


function logDebug(message) {
  if (debugOutputEnabled[0]) multiPurposeLog("DBG", message);
}
function log(message) { multiPurposeLog("LOG", message); }
function err(message) { multiPurposeLog("ERR", message); }

// not exported/exposed to other modules for the time being
function multiPurposeLog(purpose, message) {
  const date = new Date().toISOString().replace(/T|Z/g, ' ').slice(0, -5);
  // yyyy-mm-dd hh:mm:ss [PRP] msg
  const output = `${date} [${purpose}] ${message}`;
  (purpose === "ERR") ? console.error(chalk.red(output)) : console.log(output);
}

// TODO: properly adapt for use with mineflayer as a bot rather than as CT module! if (usesCT) via exported variable from sharedCoreFunctionality.mjs maybe?
function removeFormatting(message) {
  //return ChatLib.removeFormatting(message);
  // return …formatting removed for mineflayer… – this seems to be sufficient?:
  return message;
}

// helper function to remove rank and Minecraft formatting from a username
// taken & adapted from https://www.chattriggers.com/modules/v/HypixelUtilities
function removeRank(name) {
  //name = removeFormatting(name);
  return name.replace(/\[.+]/g, "").trim();
}


function containsInNestedArray(arr, str) {
  return arr.some(item => {
    if(Array.isArray(item)) {
      return item.includes(str);
    } else {
      return item === str;
    }
  });
}


/**
 * For debugging purposes.
 * @param {JSON} allowlist
 */
function printAllowlist(allowlist) {
  log("--------------");
  allowlist.forEach(function(player) {
    log("Player Names: " + player.names.join(", "));
    log("Rank (Permissions): " + player.permissionRank);
    // log("Rank (Hypixel):     " + player.hypixelRank);
    log("--------------");
  });
}

/**
 * Usage: Instead of a hardcoded `const formattedSenderName = "aphased";`, this
 * value can be fetched from playerNames.json as the first `names[0]` match
 * where the rank is equal to `botAccountOwner`.
 *
 * Calling this function only really makes sense for unique ranks (i.e, not for
 * splashers, where returning a specific person's name cannot be enforced,
 * since many hold that rank).
 * @param {string} permissionRank
 * @param {JSON} allowlist
 * @returns {boolean?} TODO: see return value below
 */
function getNameByPermissionRank(findPermissionRank, allowlist) {
  for (let i = 0; i < allowlist.length; i++) {
    if (allowlist[i].permissionRank.includes(findPermissionRank)) {
      return allowlist[i].names[0];
    }
  }
  // TODO: wrap the results in something/better error handling
  return "Name not found";
}

// TODO: use this in boolChecks' hasPermission()? Might be inefficient, though
function getPermissionRankByName(name, allowlist) {
  for (let i = 0; i < allowlist.length; i++) {
    if (allowlist[i].names.includes(name)) {
      return allowlist[i].permissionRank;
    }
  }
  // TODO: wrap the results in something/better error handling
  return "Name not found";
}

function getHypixelRankByName(name, allowlist) {
  for (let i = 0; i < allowlist.length; i++) {
    if (allowlist[i].names.includes(name)) {
      // unlike permissionRank, this might not always be there (or accurate)
      if (allowlist[i].hypixelRank != undefined) {
        return allowlist[i].hypixelRank;
      }
    }
  }
  // TODO: wrap the results in something/better error handling
  return "Name not found";
}


/**
 * TODO: update this JSDoc?
 *
 * Parses arguments from the process caller (e.g. command line
 * `node index.mjs arg1 value1`) to check if they are flags (options).
 *
 * Valid Options: -d/--debug/--debug-level, -r/--reload/--reload-data, -h/--help
 *
 * @param  {...string} args Array of options for which to check if passed,
 * and their values if they are present.
 * @returns {Map} Map of `option:value`s if present (empty string if passed
 * without value), or `option:null` if not found in the arguments.
 */
// TODO: finish adding this parseStdinArgs()
function parseStdinArgs(...argsToCheck) {
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
  while(argsToCheck.length > 0 ) {
    /* do stuff… */
    const arg = argsToCheck[0];

      // Check if the argument is a flag
      if (arg.indexOf('-') === 0) { // := .startsWith('-')
        switch(arg) {
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
            console.log('Usage: node app.js [options]');
            console.log('Options:');
            console.log('-h, --help                   Display help message');
            console.log('-d, --debug, --debug-level   Set debug output verbosity');
            console.log('-r, --reload, --reload-data  Reload JSON data (allowlist, banlist, rules)');
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
