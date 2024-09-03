"use strict";
import dotenv from "dotenv";
dotenv.config();

import Bot from "./modules/bot.mjs";
import { initDiscordBot } from "./modules/discordBot.mjs";
import Utils from "./utils/Utils.mjs";
import { allowlist, partyHostNameWithoutRank } from "./modules/manageData.mjs";

/* The main action being made in this file which represents the core
functionality is providing/exporting the bot object. Most everything else
is optional, i.e. done for improvements to the bot system. */
export {
  partyBot,
  debugOutputEnabled,
  bridgingToDiscordEnabled,
  onDataStdinHandler,
};

let utils = new Utils(
  debugOutputEnabled,
  import("./data/playerNames.json", { assert: { type: "json" } }),
  import("./data/autoKickWords.json", { assert: { type: "json" } }),
  import("./data/bingoBrewersRules.json", { assert: { type: "json" } })
);

/**
 * Instance of the Bot to be used in handleCommand.mjs.
 */
const partyBot = new Bot(partyHostNameWithoutRank, utils);

/**
 * Controls whether debug logging is shown. Implemented/used/altered (if an
 * option is given from somewhere) in utils.mjs.
 * Change as needed while running via console stdin or (TODO: this:) set it
 * beforehand on startup.
 *
 * The value is contained within an array to hack around the fact imported
 * variables are principally treated as const (..? I think? Why JS. I'm
 * assuming this uncontrolled parallel variable sharing also is **so** far
 * off from best practice, too).
 */
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
const debugOutputEnabled = [false];

/**
 * The same as debugOutputEnabled above, but for sending "bridge" messages to the Discord server.
 */
const bridgingToDiscordEnabled = [true];

/**
 * Launch Discord integration features.
 */
initDiscordBot();
