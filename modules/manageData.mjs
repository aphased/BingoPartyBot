import { removeRank } from "./utils.mjs";

import playerData from "../data/playerNames.json" with { type: "json" };
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
const partyHostAccountOwners = allowlist.find(item => item.permissionRank === "botAccountOwner")?.names || ["aphased", "RNGecko", "BingoParty"];


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
  let result = [null, null, null];

  // TODO: check if primaryName can be found in data, return if not…
  const primaryNameFound = allowlist.find(entry => entry.names[0] === primaryName);

  if (primaryNameFound == null) {
    // No possible result
    return result;
  }

  if (newPermissionRank == null) {
    // TODO: retrieve and add to result
    result[1] = null; // make this the existing value retrieved instead of null
  } else {
    // TODO assign new value to data & store
    result[1] = newPermissionRank;
    // store operations…
  }

  if (newHypixelRank == null) {
    // TODO: retrieve and add to result
    result[2] = null; // make this the existing value retrieved instead of null
  } else {
    result[2] = newHypixelRank;
    // TODO: store into data file…
  }

  return result;
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

