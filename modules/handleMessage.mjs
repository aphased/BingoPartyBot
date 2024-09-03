import { partyBot } from "../index.mjs";
import { MessageType } from "../utils/Interfaces.mjs";
import Utils from "../utils/Utils.mjs";

import {
  hasPermissions,
  hasPrefix,
} from "./boolChecks.mjs";

// Regex for party messages and whispers https://regex101.com/r/SXPAJF/2


export { parseAndExecuteMessage };

/**
 * Enables entering raw commands/other input in-game via the console stdin,
 * with interpreting all "!" commands equivalent to having
 * `From [MVP+] aphased: ` prepended (or whichever IGN is the first result in
 * playerNames.json where the rank is "botAccountOwner").
 *
 * This listener is removed in `modules/bot.mjs` if the bot gets kicked/
 * disconnected so that the program can swiftly exit and, presumably, restart.
 * (TODO: this part did not work yet reliably, somehow!?)
 */
const onDataStdinHandler = (data) => {
  const command = data.toString().trim();
  logDebug("onDataStdinHandler: '" + command + "'");
  // only allow messages beginning with "!" or "/"
  if (command.startsWith("/")) {
    // interpret as direct Minecraft/Hypixel slash command
    logDebug('Console received "/" command');
    partyBot.bot.chat(command);
  } else if (command.startsWith("!")) {
    // interpret as BingoParty (bot) command
    const formattedSenderName = getNameByPermissionRank(
      "botAccountOwner",
      allowlist
    );
    const senderHypixelRank = getHypixelRankByName(
      formattedSenderName,
      allowlist
    );
    const fullMessage = `From ${senderHypixelRank} ${formattedSenderName}: ${command}`;
    logDebug('Console received "!" command');
    logDebug("fullMessage being sent: '" + fullMessage + "'");
    // simulate a regular "real" command sent via in-game direct message from
    // the bot account owner's account, e.g. [MVP+] aphased: !p speak Something
    parseAndExecuteMessage(fullMessage);
  } else if (command.startsWith("-")) {
    // treat input from stdin as options for the running code base:
    // reloading data, changing variables (e.g. debug level shown), etc.

    logDebug('Console received "-" command');
    // TODO: finish writing handleOption(command) or similar here?
    parseStdinArgs(command);
  } else if (command.startsWith("§") || command.startsWith("!limbo")) {
    // Send bot to Hypixel Limbo - same as !p limbo
    partyBot.sendToLimbo();
  } else {
    // Explicitly discard messages starting with any other char or signals
    // so as to make potential future changes easier.
    // This means sending just a regular chat message with prior e.g. `/chat p`
    // active won't work, there always needs to be a clear e.g. `/pc` prepended.
    return;
  }
};

// attach handler to console standard input
process.stdin.on("data", onDataStdinHandler);

/**
 * Core of the bot listener, managing all incoming messages.
 * @param {ChatMessage} message
 */
function parseAndExecuteMessage(message) {
  let parsedMsgObj = message.toString();

  if(!parsedMsgObj) return;

  const { rank, playerName, msgContent } = Utils.parseMessage(parsedMsgObj);

  msgContent = Utils.stripColorCodes(msgContent);
  playerName = Utils.stripColorCodes(playerName);

  /* Here we save the (more expensive) access to allowlist data by checking for
  permissions only within the respective cases below instead of every time now
  already – as nearly all messages in this listener will _not_ be a command nor
  invite (by an allowed person no less) */

  switch (Utils.determineMessageType(parsedMsgObj)) {
    case MessageType.Whisper:
      handleWhisper(rank, playerName, msgContent);
      break;
    case MessageType.PartyInvite:
      handlePartyInvite(parsedMsgObj);
      break;
    case MessageType.PartyMessage:
      // for autoKickWords functionality & "public" `!guide` command
      handlePartyMessage(playerName, msgContent);
      break;
    default:
      break;
  }
}

/**
 *
 * @param {String} rank
 * @param {String} senderName
 * @param {String} msgContent
 */
function handleWhisper(rank, senderName, msgContent) {
  let utils = partyBot.utils;
  utils.debug.log("Message is whisper");

  if(!msgContent.startsWith(partyBot.b_prefix)) {
    if(msgContent.includes("help")) {
      // be lenient, e.g. `!help` instead of `!p help`
      replyUsage(senderName);
    } else if(msgContent.includes("Boop!")) {
      // Party-invite back anyone who boops the bot account,
      // if the setting is enabled
      if(!tempDisabledCommands.has("invite")) {
        partyBot.runCommand(`p ${senderName}`);
      }
    }
    return;
  }

  utils.debug.log("Message has prefix");

  const permissionsCheck = partyBot.utils.getPermissionsByUser({ name: senderName })
  if(!permissionsCheck) return;

  const args = msgContent.replace(partyBot.b_prefix, "").trim().split(" ");
  partyBot.partyCommands.find((value, key) => key.toLowerCase() === args[0].toLowerCase())(partyBot, senderName, args.slice(1));
}

function handleWhisperOld(rank, senderName, msgContent) {
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

    // Listen for /pc !guide (`!p publicguide`)
    if (msgContent == "!guide") {
      logDebug(`msgContent: "${msgContent.split(" ")[0]}"`);
      logDebug(`msgContent length: "${msgContent.split(" ")[0].length}"`);
      const fullMessage = `From [MVP++] ${partyHostNameWithoutRank}: !p publicguide`;
      logDebug('Received party chat "!" command');
      logDebug("fullMessage being sent: '" + fullMessage + "'");
      // simulate a regular "real" command sent via in-game party chat message
      // in order to access the regular command's logic
      /* TODO: make this have a separate, longer cooldown than the
      splasher-internal `!p guide` command… Perhaps by simply copying the
      cooldown logic and duplicating it using a second cd time variable? */
      parseAndExecuteMessage(fullMessage);
    }
  }
}
