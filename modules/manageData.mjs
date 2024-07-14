import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { removeRank } from "./utils.mjs";

// import playerData from "../data/playerNames.json" with { type: "json" };
import playerData from "../data/playerNames-unchanged-old.json" with { type: "json" };
const allowlist = playerData.playerNames;

// currently allowlist player entry scheme:
/*
{
  "names": [], // guaranteed at least the entry for main name used at names[0]
  "permissionRank": string, // one of {admin,splasher,botAccount(Owner),hob,famous,trusted} – TODO: does a "formerSplasher" rank make sense to add?
  ?"hypixelRank": string // Hypixel rank of the player's main account name
}
*/

import rulesData from "../data/bingoBrewersRules.json" with { type: "json" };
const bingoBrewersRules = rulesData;

// TODO: come up with a fitting scheme for blocked players (probably something like name, duration, reason, banStart/bannedAt date…) and import from banned.json to here


export { allowlist, bingoBrewersRules };
export { partyHostNameWithoutRank, partyHostAccountOwners };
export { isAccountOwner, isDiscordAdmin };
// TODO: all of the following implementations
export { addSplasher, removeSplasher, refreshSplasherData };
export { banPlayer, refreshBannedPlayers, updateBanDuration };
// export { bannedPlayers }


/**
 * In-game bot account name used for nicer-looking output formatting.
 * Fallback has to be set/updated manually.
*/
const partyHostNameWithoutRank = allowlist.find(item => item.permissionRank === "botAccount")?.names[0] || "BingoParty";

/**
 * List of all bot account owners coming from the JSON data
 *
 * These are IGNs which are allowed _full_ access over the bot account, 
 * e.g. BingoParty. Fallback has to be set/updated manually.
 * Insert the fallback as needed if this code is ran on an account
 * other than BingoParty, i.e. one not owned by me (aphased).
*/
const partyHostAccountOwners = allowlist.find(item => item.permissionRank === "botAccountOwner")?.names || ["aphased", "bphased", "BingoParty"];


/**
 *
 * @param {string} ign The in-game name to check
 * @returns {boolean}
 */
function isAccountOwner(ign) {
  ign = removeRank(ign).toLowerCase();
  return partyHostAccountOwners.map(entry => entry.toLowerCase()).includes(ign);
}

/**
 *
 * @param {string} ign The in-game name to check
 */
function isDiscordAdmin(ign) {
  ign = removeRank(ign).toLowerCase();
  return allowlist.find(entry => entry.permissionRank === "admin" || entry.permissionRank === "staff")?.names.map(name => name.toLowerCase()).includes(ign);
}

/**
 * Adds a new set of names for _one_ person at a time to be added to the
 * allowlist with a permissionRank of `splasher`. Add only one actual player
 * per function call, but do add all known IGNs/secondary account IGNs they
 * have.
 *
 * (TODO: implement this)
 * @param  {...string} name Full IGN optionally including Hypixel rank, just
 * one in-game name, or multiple, if player has alt accounts in use
 */
function addSplasher(...name) {

}

/**
 * Sets permissionRank from `splasher` to `formerSplasher`, removing the
 * allowlist (party moderation) permissions in the process.
 *
 * (TODO: implement this)
 * @param {string} primaryName
 */
function removeSplasher(primaryName) {

}



// Helper functions to read/write data from/to disk
// const dataFilePath = path.join(__dirname, 'someFolder', 'someFile.txt'); // __dirname doesn't work in ES module..? Hack for now:
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, '../data', 'playerNames.json');

function readData() {
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
}
function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

/**
 * (TODO: implement this)
 * Refreshes either the permissions rank, the detected hypixel rank, both, or 
 * none (if null arguments are provided) of a given splasher.
 * 
 * Returns the given player's primary stored name, the new permission and Hypixel
 * server ranks, or the previous values if null was given as the new value.
 * The only time the primaryName is returned as null is if the given primary 
 * name cannot be found, i.e. it is not already present among the stored data
 * (since addSplasher should be explicitly used for this functionality).
 *
 * @param {*} primaryName
 * @param {*} newPermissionRank
 * @param {*} newHypixelRank
 * @returns {[
  primaryName,
  permissionRank,
  hypixelRank
 ]}
 */
function refreshSplasherData(primaryName, newPermissionRank, newHypixelRank) {
  // Read current data from the file
  const allowlistFromDisk = readData();
  const result = [null, null, null];

  // Find entry with the given primaryName
  // const entry = allowlistFromDisk.playerNames.find(item => item.names[0] === primaryName);
  const entry = allowlistFromDisk.find(item => item.names[0] === primaryName);

  if (!entry) {
      return result;
  }

  result[0] = primaryName;

  // Handle permission rank update
  if (newPermissionRank == null) {
      // Retrieve and add existing permission rank to the result
      result[1] = entry.permissionRank;
  } else {
      // Update permission rank and add the new value to the result
      entry.permissionRank = newPermissionRank;
      result[1] = newPermissionRank;
  }

  // Handle Hypixel rank update
  if (newHypixelRank == null) {
      // Retrieve and add existing Hypixel rank to the result
      result[2] = entry.hypixelRank;
  } else {
      // Update Hypixel rank and add the new value to the result
      entry.hypixelRank = newHypixelRank;
      result[2] = newHypixelRank;
  }

  // Save the updated data back to the file
  // TODO: only write if it differs (i.e., new values)
  // TODO: perform the write asynchronously…?!
  writeData(allowlistFromDisk);

  // Return result as [primaryName, permissionRank, hypixelRank]
  return result;
}




const newRanks = refreshSplasherData("testNamePrimaryValue", "ex-splasher", "[VIP++++]");
console.log(newRanks); // Output should reflect the updated ranks or existing ones if new ones are null








/* 
 * TODO write documentation what params this takes (if any more than rank+ign)
 * @returns {void}
 */
function compareAndSaveHypixelRanks() {
  // The storedRank fetched from data is either outdated or still unchanged 
  // (meaning equal to the current one just retrieved from in-game),
  // but never the "more current" one.

  const storedRank = "something";
  const currentRankAndName = "something potentially else (formattedSenderName)"; 

  if (currentRankAndName[0] != "[") {
    // Player doesn't have a Hypixel rank ("non"),
    // all other checks are unnecessary
    return;
  }

  const currentWords = currentRankAndName.split(" ");
  const currentRank = currentWords[0];

  if (storedRank === currentRank) {
    // Nothing needs to be saved or refreshed, data is still current
    return;
  }

  const primaryName = currentWords[1];

  saveChanges(primaryName, currentRank);
}


/**
 * Writes changes to the player name data to disk
 * Does not guarantee anything wrt transaction completion, lol.
 */
async function saveChanges() {
  
}


/**
 *
 * @param {string} name in-game name
 * @param {int} duration in days, defaulting to a value if left empty/invalid.
 * @param {string} reason ban reason, can of course be left empty
 */
function banPlayer(name, duration, reason) {
  if (isNaN(duration)) {
    // TODO:
    // Don't make it so that function _caller_ has to convert all durations
    // => examples:
    // - "6d" into just 6
    // - "inf" (infinite/permanent ban) to e.g. Number.MAX_SAFE_INTEGER
    // - "6h" into 0.25 (days)
  }

  if (duration <= 0) {
    // default to regular Bingo event's duration (until profile deletion)
    duration = 11;
  }
}

/**
 * TODO: implement refreshBannedPlayers()…
 *
 * Periodically* goes through banned player data (which exists as the basis of
 * the in-game `/ignore list`) and checks for expired bans to remove.
 * Guarantees that once an entry is removed from the json data, the in-game "ignore add" has also been reverted (atomic actions).
 *
 * *periodically := hourly? (and once at startup → add one call to index.js!)
 */
function refreshBannedPlayers() {

  // does _not_ return an e.g. array of ban-expired-igns which still need to be
  // unbanned in-game, since that is also happening within this function.

}

/**
 * This can be used to implement early/premature unbans, i.e. a splasher
 * calling `!p unban` would update Duration to zero/set to Date.now() or sth
 *
 * (TODO: add the feature…)
 * @param {string} playerName
 * @param {int} newDuration
 */
function updateBanDuration(playerName, newDuration) {

}

