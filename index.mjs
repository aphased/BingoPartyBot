"use strict";
import dotenv from 'dotenv';
dotenv.config();

import Bot from './modules/bot.mjs';
import { logDebug, parseStdinArgs, getNameByPermissionRank, getHypixelRankByName } from './modules/utils.mjs';
import { parseAndExecuteMessage } from './modules/handleMessage.mjs';
import { allowlist } from './modules/manageData.mjs';


/* The main action being made in this file which represents the core
functionality is providing/exporting the bot object. Most everything else
is optional, i.e. done for improvements to the bot system. */
export { partyBot, debugOutputEnabled, onDataStdinHandler };


/**
 * Instance of the Bot to be used in handleCommand.mjs.
 */
const partyBot = new Bot("BingoPartyBot");


/**
 * Controls whether debug logging is shown. Implemented/used/altered (if an
 * option is given from somewhere) in utils.mjs.
 * Change as needed while running via console stdin or (TODO: this:) set it
 * beforehand on startup.
 *
 * The value is contained within an array to hack around the fact imported
 * variables are principally treated as const (..? I think? Why JS).
 */
const debugOutputEnabled = [false];
// TODO ideas
// (TODO: something like this: parse once on startup)
// const options = ["-d", "--debug", "--debug-level"];
// let newotodo_debugOutputEnabled = parseStdinArgs(options);
// TODO: maybe make this a JSON data value (changeable at runtime?!) ??
// TODO: change binary to 0/1/2/… levels of debug output (least to most spammy),
// and assign in logDebug a second parameter that is set/defaults to 0 if not
// provided for "normal" level debug logging output
// TODO: no, better, make it a command-line option for node?!
// -d /  --debug-level 0/1/2, defaulting to zero if left out, but
// defaulting to 1 if just -d is provided without argument!


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
const onDataStdinHandler = data => {
  const command = data.toString().trim();
  logDebug("onDataStdinHandler: '" + command + "'");
  // only allow messages beginning with "!" or "/"
  if (command.startsWith("/")) {
    // interpret as direct Minecraft/Hypixel slash command
    logDebug("Console received \"/\" command");
    partyBot.bot.chat(command);
  } else if (command.startsWith("!")) {
    // interpret as BingoParty (bot) command
    const formattedSenderName = getNameByPermissionRank("botAccountOwner", allowlist);
    const senderHypixelRank = getHypixelRankByName(formattedSenderName, allowlist);
    const fullMessage = `From ${senderHypixelRank} ${formattedSenderName}: ${command}`;
    logDebug("Console received \"!\" command");
    logDebug("fullMessage: '" + fullMessage + "'");
    // simulate a regular "real" command sent via in-game direct message from
    // the bot account owner's account, e.g. [MVP+] aphased: !p speak Something
    parseAndExecuteMessage(fullMessage);
  } else if (command.startsWith("-")) {
    // treat input from stdin as options for the running code base:
    // reloading data, changing variables (e.g. debug level shown), etc.

    logDebug("Console received \"-\" command");
    // TODO: finish writing handleOption(command) or similar here?
    parseStdinArgs(command);
  } else if (command.startsWith("§") || command.startsWith("!limbo")) {
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
process.stdin.on('data', onDataStdinHandler);

