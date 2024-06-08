import { log, logDebug, err, removeRank } from "./utils.mjs";

export { hasPrefix, isWhisper, isPartyMessage, hasPermissions };
export { isAccountOwner, isSamePlayer, isPartyInvite, isInSameRankCategory};

/**
 * Checks if player message starts with a prefix
 * @param {string} msg Player message.
 * @param {string} b_prefix Bot prefix.
 * @returns {boolean}
 */
function hasPrefix(msg, b_prefix){
    return msg.startsWith(b_prefix);
}

/**
 * Checks if the command is executed through a whisper (direct message).
 * @param {string} msg Player message.
 * @returns {boolean}
 */
function isWhisper(msg){
  //logDebug("isWhisper's msg: '" + msg + "'");
  return msg.trim().startsWith("From ");
}

/**
 * Checks if the message was sent into party chat.
 * @param {string} msg
 * @returns {boolean}
 */
function isPartyMessage(msg) {
  return msg.trim().startsWith("Party > ");
}

/**
 * Checks whether the player executing the command is listed as allowed, and
 * returns the **primary** in-game name stored as in use for that player, which
 * may or may not be different from the name passed in.
 * (formerly isWhitelisted)
 * @param {string} senderName Player to check against list.
 * @param {string[]} allowlist JSON of players.
 * @returns {[boolean, string]} found, primaryName
 * (TODO: fix return type not showing in jsdoc here)
 */
function hasPermissions(senderName, allowlist){
  // previous implementation: array of IGNs
  //return whitelist.includes(player.toLowerCase());
  log("Checking allowlist data...");
  logDebug("name to check: '" + senderName + "'");
  logDebug("allowlist:  '" + allowlist[0].names + "' (first entry)");

  senderName = senderName.toLowerCase();
  logDebug("name to check: '" + senderName + "' ***");

  let found = false;
  let primaryName = "";
  if (allowlist == undefined) {
    err("Allowlist undefined in hasPermissions() check!");
    return [found, primaryName];
  }

  let tmpName = "";

  for (let i = 0; i < allowlist.length; i++) {
    const names = allowlist[i].names;
    //logDebug("Checking names for", allowlist[i].permissionRank);
    for (let j = 0; j < names.length; j++) {
      //logDebug(names[j]);
      tmpName = names[0];
      if (names[j].toLowerCase() === senderName) {
        logDebug("Found permitted IGN (names[j]): '" + names[j] + "' (+ .toLowerCase()");
        logDebug("Primary name in use (names[0]): '" + names[0] + "'");
        logDebug("Primary name in use (allowlist[i].names[0]): '" + allowlist[i].names[0] + "'");
        logDebug("Primary name in use (tmpName/names[0]): '" + tmpName + "'");
        primaryName = names[0]; //OLD (maybe)
        primaryName = allowlist[i].names[0];
        // TODO: what tf is this for again? something broke w/o it, I think…
        primaryName = tmpName;
        found = true;
        // TODO: is this safe to add?
        // break;
      }
    }
  }
  logDebug("returning [found, primaryName]: '" + found + "', '" + primaryName + "'");
  return [found, primaryName];
}

/**
 *
 * @param {*} ign The in-game name to check
 * @param {*} partyHostAccountOwners List of all bot account owners from
 * JSON data
 * @returns {boolean}
 */
function isAccountOwner(ign, partyHostAccountOwners) {
  ign = removeRank(ign).toLowerCase();
  return partyHostAccountOwners.map(item => item.toLowerCase()).includes(ign);
}

/**
 * Less convoluted variant of permission check. Checks if two IGNs in the
 * allowlist belong to the same actual player/person stored.
 * @param {string} name1
 * @param {string} name2
 * @param {JSON} allowlist
 * @returns {boolean}
 */
function isSamePlayer(name1, name2, allowlist) {
  logDebug("In method: isSamePlayer");
  logDebug("name1: '" + name1 + "'");
  logDebug("name2: '" + name2 + "'");
  logDebug("allowlist's first entry:");
  logDebug(allowlist[0].names);


  //for (const player of allowlist.playerNames) {…
  //let dataLength = allowlist.playerNames.length;
  /*
  let dataLength = Object.keys(allowlist).length;
  for (let i = 0; i < dataLength; i++) {
    const player = allowlist.playerNames[i];
    if (player.names.includes(name1) && player.names.includes(name2)) {
      return true;
    }
  }
  return false;
  */


  name1 = name1.toLowerCase();
  name2 = name2.toLowerCase();

  logDebug("name1: '" + name1 + "'");
  logDebug("name2: '" + name2 + "'");

  let found = false;

  /* The effective equivalent to a nested loop is fine here, as the inner
  iterations are known to be very short. String comparisons have to be
  "normalized" (performed in all lowercase) so users can send the name in
  whichever capitalization. */
  allowlist.some(function(player) {
    // rather spammy: logDebug("player.names: '" + player.names + "'");
    // TODO: (someday…) the larger the data grows, the worse this hack becomes:
    // _all_ names are .toLowerCase()'d _every_ call of this function
    const playerNamesTemp = player.names.map(name => name.toLowerCase());
    if (playerNamesTemp.includes(name1) && playerNamesTemp.includes(name2)) {
      logDebug("isSamePlayer result:true");
      logDebug("player.names: '" + player.names + "'");
      found = true;
      // exit loop early
      return found;
    }
  });
  if (!found) logDebug("isSamePlayer result:false");

  return found;
}

/** TODO: keep? Currently unused. Could be modified to be used for checking
 * admin against splasher, or moderator against member, or similar later… */
function isInSameRankCategory(name1, name2, allowlist) {
  let rank1, rank2;
  allowlist.forEach(player => {
    if (player.names.includes(name1)) {
      rank1 = player.permissionRank;
    } else if (player.names.includes(name2)) {
      rank2 = player.permissionRank;
    }
  });
  return rank1 === rank2;
}

/**
 *
 * @param {String} msg
 * @returns {{isPartyInvite: boolean, senderName: string}} If the passed
 * message is a party invite, also returns the sender's IGN
 */
/* Yes, this function does two distinct things and the naming is technically
somewhat inaccurate, but splitting it into isPartyInvite and "getInviter" or
similar wouldn't really make sense, since it's nearly the same task */
function isPartyInvite(msg) {
  msg = msg.trim();
  /* Format of all party invites is:
  -----------------------------------------------------
  ${formattedSenderName} has invited you to join ${their, anotherIGN's} party!
  You have 60 seconds to accept. Click here to join!
  ----------------------------------------------------- */
  const startIndex = msg.indexOf("-----------------------------------------------------\n");
  const endIndex = msg.indexOf(" has invited you to join ");

  if (startIndex !== -1 && endIndex !== -1) {
    let inviterName = msg.substring(startIndex, endIndex);
    logDebug("isPartyInvite: inviterName='" + inviterName + "' (initial)");
    // TODO: what do the next lines do? remove rank?
    // if so, replace & use utils.removeRank()…?
    const words = inviterName.split(" ");
    inviterName = words[words.length - 1];
    logDebug("isPartyInvite: inviterName='" + inviterName + "' (final)");
    return {
      isPartyInvite: true,
      senderName: inviterName
    };
  } else {
    return {
      isPartyInvite: false,
      senderName: ""
    };
  }
}
