import { log, logDebug, err } from './utils.mjs';
import { getHypixelRankByName } from "./utils.mjs";

import { executeHypixelPartyCommand, commandsWithOptionalIGN } from './sharedCoreFunctionality.mjs';
import { allowlist } from './manageData.mjs';

export { runPartyCommand };


/**
 * Runs a Bingo Party command. Wraps the bingo party commands/functionality
 * for other modules.
 * @param {{
 *          playerName: string,
 *          formattedPlayerName: string,
 *          rank: string,
 *          message : string,
 *          b_prefix : string
 * }} data Player data and original message used when running the command.
 * @param {string} command
 * @param {string[]} args Arguments for command, can be 0..n long.
 */
function runPartyCommand(data, parsedCommand, args) {

    // first version: hack together aphased's BingoPartyTools' features
    // with Tryp0MC's Mineflayer port's function.
    /*
    structure from unchanged index.mjs:
        const args = msgContent.replace(b_prefix, '').trim().split(" ")
        const data = {
            playerName: playerName,
            formattedPlayerName: `${rank} ${playerName}`,
            rank: rank,
            message: msgContent,
            b_prefix: b_prefix
            primaryName: primaryIGN
        }
        const [command, ...cmdArgs] = args;
        runPartyCommand (bot, data, command, cmdArgs);
    */

    let formattedSenderName = data.formattedPlayerName;
    let command = parsedCommand;
    // the few commands which require more than 1 argument parse separately:
    let commandArgument = (args.length > 0) ? args[0] : "";
    let message = data.message;

    let primaryIGN = data.primaryName;

    // At this point, the sender is always allowed to use commands,
    // however they might not currently use their main account
    if (formattedSenderName != primaryIGN) {
      // So we display splashers' main account IGNs as the command sender
      formattedSenderName = primaryIGN;
      if (commandArgument === "" && commandsWithOptionalIGN.includes(command)) {
        // If the sender is affected by the command, the "true" sender name is
        // needed regardless, i.e. for enabling !p inv / !p promote [empty]
        // (when not given an IGN)
        commandArgument = data.playerName;
      }
    }

    // bonus feature so it looks nicer: add Hypixel rank back in as if grabbed from chat, even for displaying names that were swapped to the primary IGN
    formattedSenderName = `${getHypixelRankByName(formattedSenderName, allowlist)} ${formattedSenderName}`;

    logDebug("runPartyCommand results");
    logDebug("primaryIGN: '" + primaryIGN + "'");
    logDebug("formattedSenderName: '" + formattedSenderName + "'");

    // call existing core function from the CT module with the params it expects
    executeHypixelPartyCommand(formattedSenderName, command, commandArgument, message);
}

