import { log, logDebug, err } from "./utils.mjs";
import {
  hasPermissions,
  isWhisper,
  hasPrefix,
  isPartyInvite,
  isPartyMessage,
} from "./boolChecks.mjs";
import { runPartyCommand } from "./handleCommand.mjs";
import { partyBot } from "../index.mjs";
import {
  replyUsage,
  tempDisabledCommands,
} from "./sharedCoreFunctionality.mjs";
import { allowlist, partyHostNameWithoutRank } from "./manageData.mjs";

import kickableData from "../data/autoKickWords.json" with { type: "json" };
const autoKickWords = kickableData.autoKickWords;
// TODO: if this system ever causes any big unforeseen issues, just insert/use this instead:
// const autoKickWords = ["sakldhjldsahjabfsfhkfahkjasfhj-thiswillneverbematched"];

// Regex for party messages and whispers https://regex101.com/r/SXPAJF/2
const messageRegex =
  /^(?:Party >|From) ?(?:(\[.*?\]) )?(\w{1,16}): (.*?)(?:§.*)?$/s;

export { parseAndExecuteMessage };

/**
 * Core of the bot listener, managing all incoming messages.
 * @param {ChatMessage} message
 */
function parseAndExecuteMessage(message) {
  let parsedMsgObj = message.toString();

  if (parsedMsgObj == "") {
    /* Without this check, there'd be a crash upon entering "/pl" via console
    stdin due to the blank lines in the output (list of party members), meaning
    the root cause here is me reusing the function meant for Mineflayer text
    "objects" (which are not a basic string) for the commands sent from stdin,
    i.e. ones that were not even originating in-game. Thus the non type-strict
    comparison is correct. */
    // Replace empty lines with a single space to make life easier
    parsedMsgObj = " ";
  }

  //logDebug("parsedMsgObj: '" + parsedMsgObj + "'");

  const { rank, playerName, msgContent } = parseMessage(parsedMsgObj);

  /* Here we save the (more expensive) access to allowlist data by checking for
  permissions only within the respective cases below instead of every time now
  already – as nearly all messages in this listener will _not_ be a command nor
  invite (by an allowed person no less) */

  // too spammy & most often not even needed yet for general debugging
  //logDebug("At parseAndExecuteMessage(), message is not yet checked to be a whisper, with the following:");
  //logDebug("rank: '" + rank + "'");
  //logDebug("playerName: '" + playerName + "'");
  //logDebug("msgContent: '" + msgContent + "'");

  switch (determineMessageType(parsedMsgObj)) {
    case "whisper":
      handleWhisper(rank, playerName, msgContent);
      break;
    case "partyInvite":
      handlePartyInvite(parsedMsgObj);
      break;
    case "partyMessage":
      // for autoKickWords functionality & "public" `!guide` command
      handlePartyMessage(playerName, msgContent);
      break;
    default:
      // do nothing (returned undefined)
      // spammy:
      // logDebug("Message is neither whisper (dm) nor a party message or invite");
      break;
  }
}

/**
 *
 * @param {*} parsedMsgObj
 * @returns String of message type – either "whisper", "partyInvite",
 * "partyMessage", or `unknown`
 */
function determineMessageType(parsedMsgObj) {
  if (isWhisper(parsedMsgObj)) return "whisper";
  else if (isPartyInvite(parsedMsgObj).isPartyInvite) return "partyInvite";
  else if (isPartyMessage(parsedMsgObj)) return "partyMessage";
  else return undefined;
}

/**
 * Parses messages into sender and message content parts, where messages may be
 * sent directly or to party chat (prefixes `From `, `Party > `, etc.)
 * @param {string} msg
 * @returns {{rank: string,
 *           playerName: string,
 *           msgContent: string}} Player data as well as message content.
 */
function parseMessage(msg) {
  const match = msg.match(messageRegex);
  // If regex not matched, return nothing
  if (!match) return [null, null, null];
  // Sets all the other stuff
  const [, rank = "", playerName, msgContent] = match;

  if (determineMessageType(msg) != undefined) {
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
}

function handleWhisper(rank, senderName, msgContent) {
  logDebug("Message is whisper");

  if (!hasPrefix(msgContent, partyBot.b_prefix)) {
    if (msgContent.includes("help")) {
      // be lenient, e.g. `!help` instead of `!p help`
      replyUsage(senderName);
    } else if (msgContent.includes("Boop!")) {
      // Party-invite back anyone who boops the bot account,
      // if the setting is enabled
      if (!tempDisabledCommands.has("invite")) {
        partyBot.runCommand(`p ${senderName}`);
      }
    }
    return;
  }

  logDebug("Message has prefix");
  // This is basically what equals an `if isSplasher(sender)`
  const permissionsCheck = hasPermissions(senderName, allowlist);
  if (!permissionsCheck[0]) return;

  const args = msgContent.replace(partyBot.b_prefix, "").trim().split(" ");
  const data = {
    playerName: senderName,
    formattedPlayerName: `${rank} ${senderName}`,
    rank: rank,
    message: msgContent,
    b_prefix: partyBot.b_prefix,
    primaryName: permissionsCheck[1],
  };
  const [command, ...cmdArgs] = args;
  logDebug("data.senderName, primaryName, command, cmdArgs:");
  logDebug(
    "'" +
      data.senderName +
      "', '" +
      data.primaryName +
      "', '" +
      command +
      "', '" +
      cmdArgs +
      "'",
  );

  log("Executing command: '" + command + "' with args: '" + cmdArgs + "'");
  runPartyCommand(data, command, cmdArgs);
}

function handlePartyInvite(parsedMsgObj) {
  // check for "setting" invite feature being disabled
  if (tempDisabledCommands.has("invite")) {
    return;
  }
  // TODO: optimize this and the other isPartyInvite call, (by splitting the function up) somehow?
  const result = isPartyInvite(parsedMsgObj);
  // different player name & format than given from parseWhisper() above:
  const invitingPlayerName = result.senderName;
  // This is basically what equals an `if isSplasher(sender)`
  const permissionsCheck = hasPermissions(invitingPlayerName, allowlist);
  if (!permissionsCheck[0]) return;
  const command = "party accept " + invitingPlayerName;
  logDebug(`Sender Name: '${invitingPlayerName}'`);
  logDebug("result.isPartyInvite='" + result.isPartyInvite + "'");
  logDebug("bot: '" + partyBot.name + "'");
  logDebug("command: '" + command + "'");
  // there is no harm in accepting an invite while already currently being
  // leader of a (public) party, so to simplify, we don't check for that
  partyBot.runCommand(command);
  return;
}

function handlePartyMessage(senderName, msgContent) {
  if (autoKickWords.some((value) => msgContent.trim().startsWith(value))) {
    logDebug(autoKickWords);
    // default, immediate punishment for spammers: kick from party;
    // blocking can/has to be decided and ran manually
    const command = "party kick " + senderName;
    // Party leader (the bot account) can't kick p leader (ex. misused !p say)
    if (senderName != partyHostNameWithoutRank) {
      log(`Kicked ${senderName} because of autoKickWords rule`);
      partyBot.runCommand(command);
    } else {
      log("Someone, presumably splasher, used an auto-kick word");
    }
  } else {
    logDebug("No auto-kickable phrase detected");
    // return;

    // Listen for /pc !guide
    /*
    TODO: figure out the reason(s) for... this mess?
    2024-08-09 22:20:01 [MSG] Party > [MVP+] aphased: !guide
    2024-08-09 22:20:01 [DBG] rank, senderName, msgContent: '[MVP+]', 'aphased', '!guide§9Party §8> §b[MVP§9+§b] aphased§f: !guide'
    2024-08-09 22:20:01 [DBG] No auto-kickable phrase detected
    2024-08-09 22:20:01 [DBG] msgContent: "!guide§9Party"
    2024-08-09 22:20:01 [DBG] msgContent length: "13"
    2024-08-09 22:20:01 [DBG] Received party chat "!" command
    … normal/as expected from here:
    2024-08-09 22:20:01 [DBG] fullMessage being sent: 'From [MVP++] BingoParty: !p publicguide'
    2024-08-09 22:20:01 [DBG] rank, senderName, msgContent: '[MVP++]', 'BingoParty', '!p publicguide'
    …
    also compare with:
    2024-08-09 22:26:48 [MSG] Party > [MVP+] aphased: !guideandlongermessage
    2024-08-09 22:26:48 [DBG] rank, senderName, msgContent: '[MVP+]', 'aphased', '!guideandlongermessage§9Party §8> §b[MVP§9+§b] aphased§f: !guideandlongermessage'
    2024-08-09 22:26:48 [DBG] No auto-kickable phrase detected
    2024-08-09 22:26:48 [DBG] msgContent: "!guideandlongermessage§9Party"
    2024-08-09 22:26:48 [DBG] msgContent length: "29"
    2024-08-09 22:26:48 [DBG] Received party chat "!" command
    2024-08-09 22:26:48 [DBG] fullMessage being sent: 'From [MVP++] BingoParty: !p publicguide'
    2024-08-09 22:26:48 [DBG] rank, senderName, msgContent: '[MVP++]', 'BingoParty', '!p publicguide'
    */
    if (
      msgContent.startsWith("!guide") &&
      // msgContent.split(" ")[0].length == 6
      // equals to 13 because… I don't know (yet)?? See above.
      msgContent.split(" ")[0].length == 13
    ) {
      logDebug(`msgContent: "${msgContent.split(" ")[0]}"`);
      logDebug(`msgContent length: "${msgContent.split(" ")[0].length}"`);
      const fullMessage = `From [MVP++] ${partyHostNameWithoutRank}: !p publicguide`;
      logDebug('Received party chat "!" command');
      logDebug("fullMessage being sent: '" + fullMessage + "'");
      // simulate a regular "real" command sent via in-game party chat message
      // in order to access the regular command's logic
      /* TODO: make this have a separate, longer cooldown than the
      splasher-internal `!p guide` command… Perhaps by simply copying the
      cooldown logic over and permanently duplicating it in this file? */
      parseAndExecuteMessage(fullMessage);
    }
  }
}
