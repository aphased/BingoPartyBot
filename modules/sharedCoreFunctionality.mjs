import { log, logDebug, err, getNameByPermissionRank } from './utils.mjs';
import { partyBot } from "../index.mjs";
import { hasPermissions, isSamePlayer, isAccountOwner } from './boolChecks.mjs';
import { removeRank, printAllowlist } from "./utils.mjs";
import { partyHostAccountOwners, partyHostNameWithoutRank } from './manageData.mjs';

import { allowlist, bingoBrewersRules } from './manageData.mjs';
import { getBingoGuideLink, setBingoGuideLink } from './discordBot.mjs';

// The common "interface" to provide to both the CT module and the Mineflayer bot-specific logic
export { executeHypixelPartyCommand, commandsWithOptionalIGN, replyUsage };


/**
 * Flag for the "environment" in which this part of the code is ran –
 * always set to false if module is ran as a Mineflayer bot.
 */
const usesChatTriggers = false;


// Used for preventing duplicate, repeated output
const THIRTY_SECONDS = 30 * 1000;
let lastActionTimeGuidePosted = 0;


/**
 * This function masks the true implementation of how messages/commands are
 * output to Hypixel servers in the game, which makes switching implementation
 * (from ChatTriggers to e.g. Mineflayer) and reusing code far more easy.
 * @param {String} command  The command to be sent to Hypixel, **without**
 * preceding slash. This is also applicable for regular chat messages, which
 * should always specify their respective channel (e.g. `pc <message to party>`, `msg <ign> <direct message whisper>`, etc.)
 */
function outputCommand(command) {
  if (!command) return;

  if (command.length > 255){
    // max. Minecraft chat message length is 256 chars
    command = command.slice(0, 255);
  }

  logDebug("outputCommand '" + command + "'");
  if (usesChatTriggers) {
    // Using ChatTriggers' command function, which prepends the slash
    ChatLib.command(command);
  } else {
    // Using Mineflayer, with a function defined to do the same
    partyBot.runCommand(command);
  }
}

/**
 * Exists to turn a common three-line operation into a one-liner.
 * @param {String} command  Full command message to be executed
 * **without** leading slash "/"
 * @param {Number} timeout  Integer time to wait until command execution in
 * milliseconds (thanks Hypixel)
 */
function waitAndOutputCommand(command, timeout) {
  // Ensure to wait at least half a second if this function is called
  let waitDuration;
  if (usesChatTriggers) {
    waitDuration = timeout > 500 ? timeout : 500;
    setTimeout(() => {
      outputCommand(command);
    }, waitDuration);
  } else {
    // adapted to rather use the bot's tick-based system with a minimum of
    // 10 ticks (500ms), as minecraft/mineflayer run on 20 ticks per second
    // (i.e. 1 tick := 50 ms)
    // TODO: fix whatever this is and why it didnt work yet
    //waitDuration = timeout > 500 ? (timeout/50) : (500/50);
    //bot.waitForTicks(waitDuration*15);
    //outputCommand(command);

    // tmp alternative: like it was handled previously in ct
    waitDuration = timeout > 500 ? timeout : 500;
    logDebug("waitDuration: '" + waitDuration + "'");
    setTimeout(() => {
      outputCommand(command);
    }, waitDuration);

  }
}

/**
 * Checks if the passed in-game name is allowed to moderate the party.
 * This function primarily exists to mask the implementation of "allowlist",
 * so we can more easily change it later in just one place (here), if needed.
 * @param {String} formattedPlayerName  Account name of player to be checked
 * against allowlist – can be but does not have to be including Minecraft
 * formatting, Hypixel rank, and in any combination of upper-/lower-casing)
 * @returns {boolean}
 */
function playerHasPermissions(formattedPlayerName) {
  // TODO: remove and/or combine old implementations (ChatTriggers &
  // Mineflayer versions compatibility)
  if (usesChatTriggers) {
    // Old, but currently still in use (CT) implementation:
    const unformattedPlayerName = removeRank(formattedPlayerName).toLowerCase();
    return allowlist.includes(unformattedPlayerName);
    /* Alternative implementation if the allowlist is ever turned into a nested
    array (a sub-array for each splasher, with more than one entry resembling a
    player's main plus "alt" accounts): */
    // return containsInNestedArray(allowlist, unformattedPlayerName);
  } else {
    // Mineflayer Bot implementation:
    const [found, primaryPlayerName] = hasPermissions(formattedPlayerName, allowlist);
    return found;
  }
}


/*
 * The following lists facilitate some checks at the beginning of functions
 * executeHypixelPartyCommand() and runPartyCommand(), respectively.
 *
 * Permanent TODO: keep these updated in case new commands and/or aliases are
 * added in either category.
 */

/**
 * Commands with negative effect on receivers, some groups of users are
 * exempt from being affected by these (splashers/whitelisted players).
 */
const negativeCommands = ["kick", "remove", "ban", "block"];
/** Commands which require more than one arg. */
const commandsRequiringFullMessage = ["speak", "say", "repeat", "rep", "customrepeat", "crepeat", "customrep", "crep", "flea", "bf", "poll", "cmd"];
/** Commands which should work on the sender if passed without argument (their own IGN). */
const commandsWithOptionalIGN = ["inv", "invite", "pro", "prom", "promo", "promote", "boopme"];


/**
 * These alternating output messages (for when the same `!p help` command is
 * sent multiple times in a short time) exist for circumventing – at least
 * partially – Hypixel's "You cannot say the same message twice!"
 */
const helpMessages = ["r For a list of available commands see github dot \
  com/aphased/BingoPartyCommands",
  "r GitHub: aphased/BingoPartyCommands for all commands",
  "r All commands are shown on GitHub: aphased/BingoPartyCommands"];
let helpOutputIndex = 0;



/**
 * Exists to turn a common three-line operation into a one-liner,
 * as well as to reduce code repetition, and to propagate changes
 * to the output message used to *all* places where the output is used.
 * @param {String} settingCategory  Name of overarching setting category (typically `BingoPartyFeatures`)
 * @param {String} setting  Name of setting itself (e.g. `Party mute`)
 * @param {String} command  Name of toggled-off command to inform about
 * @returns {Number} value less than zero if setting is toggled **off**, positive integer otherwise (i.e., if setting is enabled)
 */
function checkSetting(settingCategory, setting, command) {
  if (usesChatTriggers) {
    // (for now) use a SettingsManager SettingsObject for ChatTriggers module
    if (!BingoPartyTools.getSetting(settingCategory, setting)) {
      let informDisabledSetting = "r This setting is currently disabled. ("+ command + ")";
      outputCommand(informDisabledSetting);
      return false;
    } else return true;
  } else {
    // all settings are enabled if ran as a full bot
    return true;
  }
}


function replyUsage(sender) {
  // Todo: this should? have a checkSetting() call, I think
  waitAndOutputCommand(`r Hi ${sender}, use !p help `, 500);
}

// function replyHelp() { }


const MAX_REP_COUNT = 7
const MAX_PAUSE_DUR = 9
/**
 * For repeatedly outputting the same command sender's message in party chat,
 * used in e.g. `!p rep` as well as `!p customrepeat`.
 *
 * This function also checks for the limits, and sets arguments to the min/max
 * if under/over the allowed values, currently repeating output a maximum of 7
 * times with maximally 9 seconds in between each message.
 * (MAX_REP_COUNT, MAX_PAUSE_DUR)
 *
 * @param {boolean} customCommand    if repeat or customrepeat command was used
 * @param {string} message    the entire message to be sent, i.e. everything
 * after `Party > [MVP++] BingoParty: `
 * @param {string} formattedSenderName  name with Hypixel rank (e.g. `[MVP+]
 * splasher`)
 */
function repeatSenderInPartyChat(customCommand, message, formattedSenderName) {
  let messageWords = message.split(" ");
  // TODO: fix these annotations (not showing type as int but as any on hover…)
  /** @param {int} repCount number of repetitions to output the message for */
  let repetitionCount = 5;
  let customRepsGiven = false;
  /** @param {int} waitDuration  time in millis to wait between each message output */
  let waitDuration = 2000;

  // TODO: this function needs to check for the maximum allowed rep count/wait duration (OLD: 8 times & 15s, now: 7x & 9s)
  if (messageWords.length > 1) {
    repetitionCount = messageWords[0];
    logDebug("repetitionCount='" + repetitionCount + "' (initial value)");

    if (repetitionCount === undefined || isNaN(repetitionCount)) {
      // reset to default value if invalid
      repetitionCount = 5;
    } else {
      // remove the repetition count number from message output if it was valid
      messageWords.shift();
      // check for valid value range, 1 <= repCount <= MAX_REP_COUNT
      repetitionCount = Math.min(Math.max(repetitionCount, 1), MAX_REP_COUNT);
      customRepsGiven = true;
    }
  }

  logDebug("customCommand: '" + customCommand + "'");
  logDebug("customRepsGiven: '" + customRepsGiven + "'");
  logDebug("(messageWords.length > 1): '" + (messageWords.length > 1) + "'");

  /* standard `!p rep` command spec only allows for setting repetition count,
  but not custom waiting duration, so we don't check for it in that case. Also,
  the waiting duration between messages can only be set if already the repetition count before it was _also_ given in the message (since we don't use named args for ease of use, the order has to be fixed) */
  // basically: duration, if given, is only valid if it's the second (in the original string) word in the message
  if (customCommand && customRepsGiven && messageWords.length > 1) {
    waitDuration = messageWords[0];
    logDebug("waitDuration='" + waitDuration + "' (initial value)");

    if (waitDuration === undefined || isNaN(waitDuration)) {
      waitDuration = 2000;
    } else {
      messageWords.shift();
      // potentially valid duration was given, in seconds, thus:
      // 1) remove from message to be sent,
      // 2) keep within allowed range (0-8 seconds)
      // 3) multiply to milliseconds
      if (waitDuration > MAX_PAUSE_DUR) {
        waitDuration = MAX_PAUSE_DUR * 1000; // e.g. 9s
      } else if (waitDuration < 2) {
        waitDuration = 2000; // 2s
      } else {
        // valid duration value, multiply to ms
        waitDuration *= 1000;
      }
    }
  }
  logDebug("after if (customCommand && customRepsGiven && messageWords.length > 1) check");

  message = messageWords.join(" ");
  const outputString = "pc " + formattedSenderName + ": " + message;

  logDebug("(modified final) message='" + message +  "'");
  logDebug("repetitionCount='" + repetitionCount + "'");
  logDebug("waitDuration='" + waitDuration + "'");

  if (repetitionCount === 1) outputCommand(outputString); // No need to wait
  else {
    for (let i = 0; i < repetitionCount; i++) {
      // Implement the waiting duration between messages by applying an offset to the timeout with each iteration, by multiplying with iterator
      waitAndOutputCommand(outputString, waitDuration*i);
    }
  }
}



/**
 * Core "Bingo party" commands logic.
 * This function can be called both in the Chat Triggers module, when receiving
 * messages from the Mineflayer module (either in-game or console stdin) when
 * ran as a bot, or even perhaps in the future received from the Discord.
 *
 * Currently active commands and all aliases are documented with explanations at
 * https://github.com/aphased/BingoPartyCommands.
 *
 * @param {String} formattedSenderName  IGN plus Hypixel rank prepended, and
 * potentially Minecraft formatting codes, e.g. `[MVP+] splasherName`
 * @param {String} command  The entire single-word command to be executed
 * @param {String} commandArgument  Optional argument to the main command,
 * most commonly used as `receivingPlayerName`, i.e. an IGN for the player
 * "affected" by some commands, for example kicking from or inviting to the
 * party. All commands have exactly one argument, except for speak, which uses
 * the entire rest of the message.
 * @param {String} message  The entire message of the command (everything after
 * e.g. `From formattedSenderName: `)
 */
function executeHypixelPartyCommand(formattedSenderName, command, commandArgument, message) {
  logDebug("executeHypixelPartyCommand() called with the following:");
  logDebug("formattedSenderName: '" + formattedSenderName + "'");
  logDebug("command: '" + command + "'");
  logDebug("commandArgument(s): '" + commandArgument + "'");
  logDebug("message: '" + message + "'");
  const senderNameArray = formattedSenderName.split(" ");
  if (senderNameArray[0].startsWith("undefined")) {
    // prevent ever outputting "undefined splasherIGN" instead of e.g. "[MVP+] splasherIGN" if the rank is missing in the imported data:
    formattedSenderName = senderNameArray.length < 2 ? err(`An allowlisted name is undefined: '${formattedSenderName}'`) : senderNameArray[0];
  }
  formattedSenderName = formattedSenderName.trim();

  /** Used in output for formatting; case-preserving rank-removed sender IGN */
  const rankRemovedSenderName = removeRank(formattedSenderName);

  let receivingPlayerName = commandArgument.toString() || "";
  // Minecraft IGNs only allow for a-Z, 0-9, and underscores, we remove all special characters so "splasher detection" will always work (e.g. "\IGN" to "IGN") as pointed out by p0iS (thanks)
  logDebug("receivingPlayerName: '" + receivingPlayerName + "'");
  receivingPlayerName = receivingPlayerName.replace(/[^a-zA-Z0-9_]/g, '');
  command = command.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');

  /* Prevent splashers from kicking or even banning
  other players who have mod permissions: */
  if (negativeCommands.includes(command)) {
    if (receivingPlayerName.toLowerCase() === partyHostNameWithoutRank.toLowerCase()) {
      /* Can't kick the party leader, have a little fun instead. Made a little
      less hard-coded unto myself and more interchangeable by pulling the party
      host name from the player data (allowlist) */
      outputCommand(`pc ${formattedSenderName} tried ${command}ing [MVP++] ${partyHostNameWithoutRank} from the party. L bozo!`);
      return;
    }

    // Previous check with the "simple" allowlist was:
    /* All other commands negatively affecting splashers
    (i.e. players with permissions) are simply ignored */
    /*if (playerHasPermissions(receivingPlayerName)) {
      return;
    }*/
    // Now, a more fine-tuned/granular decision is possible:

    /* Disallow negative actions on accounts which
    do not belong to the command sender (splasher's own main & alt accounts) */
    if (playerHasPermissions(receivingPlayerName)) {
      logDebug(`Has Permissions: 'receivingPlayerName', sender: '${formattedSenderName}'`);
      if (!isSamePlayer(rankRemovedSenderName, receivingPlayerName, allowlist)) {
        log("Not kicking another splasher");
        return;
      }
    }
  }

  logDebug("Passed negative commands check");

  /* Hypixel quote 2024-01: "You are sending commands too fast! Please slow
  down." + "You can only send a message once every half second!"
  – And yet this issue persisted with anything up to like 2 seconds delay…
  Furthermore of note: ooffyy said 2024-01-07 that queueing commands was
  apparently (?) disallowed by Hypixel, so we apply the wait individually every
  time instead of just using queue-like push/wait+send/pop operations */
  /** Standard timeout to wait for in between outputting messages, in milliseconds. */
  let defaultTimeout = 2190 + Math.floor(Math.random() * 41) - 20;

  /**
   * The message string, minus the first two words – "!p command" – removed.
   * TODO: keep the number of words "sliced off" **updated** in case of ever
   * moving away from the `!p command` system, to e.g. just `!command`.
   */
  let messageToBroadcast = "";
  if (commandsRequiringFullMessage.includes(command)) {
    messageToBroadcast = message.split(" ").slice(2).join(" ");
    // don't output "[MVP+] splasherIGN: " in the say/repeat commands if the message is empty, exit early instead:
    if (messageToBroadcast.length == 0) return;
  }

  switch(command) {
  case "disband":
    // disband is never allowed! "undocumented" non-command
    // (so, perform zero actions except for this funny-eerie bot response)
    waitAndOutputCommand("r What exactly are your plans, " + rankRemovedSenderName + "? :raisedEyebrow:", defaultTimeout);
    break;
  case "transfer":
    if (!checkSetting("BingoPartyFeatures", "Party transfer", command))
      break;
    if (receivingPlayerName === "") {
      // receiving account has to be explicitly listed
      break;
    }
    outputCommand("pc Party was transferred to " + receivingPlayerName + " by " + formattedSenderName + ".");
    waitAndOutputCommand("p transfer " + receivingPlayerName, defaultTimeout);
    break;
  case "unmute":
    // fallthrough for additional alias
  case "mute":
    if (!checkSetting("BingoPartyFeatures", "Party mute", command))
      break;
    outputCommand("p mute");
    waitAndOutputCommand("pc Party mute was used by " + formattedSenderName + ".", defaultTimeout);
    break;
  case "pro":
  case "prom":
  case "promo":
    // fallthroughs for additional alias
  case "promote":
    if (!checkSetting("BingoPartyFeatures", "Party promote", command))
      break;
    if (receivingPlayerName === "") {
      // no name supplied, thus default to promoting command sender instead
      receivingPlayerName = rankRemovedSenderName;
    }
    //logDebug("before promote msg");
    outputCommand("pc " + receivingPlayerName + " was promoted by " + formattedSenderName + ".");
    //logDebug("after promote msg; before promote cmd");
    waitAndOutputCommand("p promote " + receivingPlayerName, defaultTimeout);
    //logDebug("after promote cmd");
    break;
  case "boopme":
    // this doesn't work for people who have receiving direct messages from anyone disabled:
    waitAndOutputCommand(`boop ${(receivingPlayerName||rankRemovedSenderName)}`, defaultTimeout/2);
    break;
  case "ka":
    // fallthrough for additional alias
  case "ko":
    // fallthrough for additional alias
  case "kickafk":
    // fallthrough for additional alias
  case "kickoffline":
    if (!checkSetting("BingoPartyFeatures", "Party kickoffline", command))
      break;
    outputCommand("p kickoffline");
    break;
  case "remove":
    // fallthrough for additional alias
  case "kick":
    if (!checkSetting("BingoPartyFeatures", "Party kick", command))
      break;
    if (receivingPlayerName === "") {
      break;
    }
    outputCommand("pc " + receivingPlayerName + " was kicked from the party by " + formattedSenderName + ".");
    waitAndOutputCommand("p remove " + receivingPlayerName, defaultTimeout);
    break;
  case "ban":
    // fallthrough for additional alias
  case "block":
    if (!checkSetting("BingoPartyFeatures", "Party block", command))
      break;
    if (receivingPlayerName === "") {
      break;
    }
    // TODO: 2024-07-01 temporary? fix: Hypixel broke using the block (formerly ignore) feature
    // while the player is in Limbo (block add/remove/even list…).
    // Solution, for now: move to lobby for every block/unblock action
    // (and as noted by BossFlea: don't insist send back to Limbo by sending "§" afterwards)
    outputCommand("l");
    
    waitAndOutputCommand("block add " + receivingPlayerName, defaultTimeout+500);

    waitAndOutputCommand("p remove " + receivingPlayerName, 500);
    waitAndOutputCommand("pc " + receivingPlayerName + " was removed from the party and blocked from rejoining by " + formattedSenderName + ".", defaultTimeout);
    break;
  case "unban":
    // fallthrough for additional alias
  case "unblock":
    if (!checkSetting("BingoPartyFeatures", "Party unblock", command))
      break;

    // See comment under case "block": send to lobby as temp fix
    outputCommand("l");
    
    waitAndOutputCommand("block remove " + receivingPlayerName, defaultTimeout+500);
    waitAndOutputCommand("r Removed " + receivingPlayerName + " from block list.");
    break;
  case "open":
    // fallthrough for additional aliases
  case "public":
    // fallthrough for additional aliases
  case "stream":
    logDebug("case stream reached!");
    if (!checkSetting("BingoPartyFeatures", "Party open (stream size)", command))
      break;
    // Hypixel's lowest for a public party is a maximum of two members, but
    // that does not really make sense for the bingo party. Adapt as needed.
    let minimumPartySlots = 10; // 20, 30, …
    let maximumPartySlots = 100; // Hypixel server-given limit
    // number of party slots count to open up for (rarely, if ever, has a reason
    // not to be 100). If it isn't integer, we use the maximum as default
    let newPartySize = parseInt(commandArgument);
    if (newPartySize != NaN) {
      if (newPartySize >= minimumPartySlots && newPartySize <= maximumPartySlots) {
        // only assign user input as max. party size if it's valid, stick
        // with maximum possible (rather than minimum) size otherwise
        maximumPartySlots = newPartySize;
      }
    }
    logDebug("before 2 outputCommands");
    outputCommand("pc Party size was set to " + maximumPartySlots + " by " + formattedSenderName + ".");
    waitAndOutputCommand("stream open " + maximumPartySlots, defaultTimeout);
    logDebug("before 2 outputCommands");
    logDebug("Re-opened party");
    break;
  case "inv":
    // fallthrough for additional alias
  case "invite":
    if (!checkSetting("BingoPartyFeatures", "Party invite", command))
      break;
    if (receivingPlayerName === "") {
      // no name supplied, thus invite command sender instead
      //receivingPlayerName = removeRank(formattedSenderName);
      receivingPlayerName = rankRemovedSenderName;
    }
    outputCommand("p invite " + receivingPlayerName);
    waitAndOutputCommand("pc " + formattedSenderName + " invited " + receivingPlayerName + " to the party.", defaultTimeout);
    break;
  case "allinvite":
    if (!checkSetting("BingoPartyFeatures", "Party allinvite", command))
      break;
    outputCommand("p setting allinvite");
    waitAndOutputCommand("pc " + formattedSenderName + " toggled allinvite setting.", defaultTimeout);
    break;
  case "say":
    // fallthrough for additional alias
  case "speak":
    if (!checkSetting("BingoPartyFeatures", "Party speak", command))
      break;
    //outputCommand("pc " + formattedSenderName + ": " + messageToBroadcast);
    // special case of !p rep: repeat (output) the message, but just once
    messageToBroadcast = "1 " + messageToBroadcast;
    repeatSenderInPartyChat(true, messageToBroadcast, formattedSenderName);
    break;
  case "rep":
    // fallthrough for additional alias
  case "repeat":
    if (!checkSetting("BingoPartyFeatures", "Party repeat", command))
      break;
    // TODO: check if implemented according to notes
    // let repetitionCount = receivingPlayerName;

    // TODO: Use repeatInPartyChat(messageToBroadcast, 5orVar, 2000) here…
    // Function will use the default values we want if not specified otherwise in the message
    repeatSenderInPartyChat(false, messageToBroadcast, formattedSenderName); //, repetitionCount, 2000);
    break;
  case "crep":
    // fallthrough for additional alias
  case "crepeat":
    // fallthrough for additional alias
  case "customrep":
    // fallthrough for additional alias
  case "customrepeat":
    if (!checkSetting("BingoPartyFeatures", "Party customrepeat", command))
      break;
    // TODO: finish implementing // check if correctly implemented
    // TODO: Use repeatInPartyChat(messageToBroadcast, customCountVar, customWaitDurVar) here…
    logDebug("Custom repeat:");
    logDebug("messageToBroadcast='" + messageToBroadcast +  "'");
    // let customRepetitionCount = receivingPlayerName;
    repeatSenderInPartyChat(true, messageToBroadcast, formattedSenderName); //,customRepetitionCount);
    break;
  case "flea":
    // fallthrough for additional alias
  case "bf":
    if (!checkSetting("BingoPartyFeatures", "Party BossFlea announcement", command))
      break;
    /*
    BossFlea-style splash announcement contained in one command ("!p bf HUB 16")
    equivalent to
    - !p crep 4 4 <msg>
    - !p speak <msg> approx. 20 seconds after that
    */
    repeatSenderInPartyChat(true, "4 4 " + messageToBroadcast, formattedSenderName);
    const WAIT_TIME_UNTIL_LAST_WARNING = (16+20)*10**3;
    waitAndOutputCommand(messageToBroadcast, WAIT_TIME_UNTIL_LAST_WARNING);
    break;
  case "pl":
    // fallthrough for additional alias
  case "size":
    // TODO: Using the upcoming Mod API, dm back "party member count: xx",
    // for checking in on the party even while not in it
    // (or previously extracted from /pl – would've probably been akin to:
    // outputCommand("pl");
    // memberMessage = /* more parsing…? */ "";
    // outputCommand("r " + memberMessage);
    // could perhaps be done similarly to HypixelUtilities' "improved friends
    // list" output?)
    break;
  case "lsbanned":
    // TODO: For use as a bot account, to automate/help in managing users added
    // to the account's ignore list ("blocked"/"banned").
    // If I don't write this feature anymore (see manageData.mjs), the party
    // leader bot account owner has to perform this task, or simply un-ignore
    // i.e. unblock IGNs manually as requested.
    break;
  case "printallowed":
    // fallthrough for additional alias
  case "printAllowlist":
    // fallthrough for additional alias
  case "lsallowed":
    /* Admin-only command.
    Output will currently only be visible on the server console. */
    if (!isAccountOwner(rankRemovedSenderName, partyHostAccountOwners)) {
      replyUsage(rankRemovedSenderName);
      break;
    }
    printAllowlist(allowlist);
    break;
  case "rule":
    //logDebug("entered case \"rule\"");
    if (!checkSetting("BingoPartyFeatures", "Party rule", command))
      break;
    let ruleNumber = commandArgument || "1";
    // Convert map keys into array to check against
    const RuleNames = Array.from(Object.keys(bingoBrewersRules));

    if (!RuleNames.includes(ruleNumber)) { // default to rule 1
      //logDebug("within if (given rule not existing");
      ruleNumber = "1";
    }
    //logDebug("ruleNumber after if !included: '" + ruleNumber + "'");
    outputCommand("pc --- Bingo Brewers rules ---");
    waitAndOutputCommand("pc Rule #" + ruleNumber + ": " + bingoBrewersRules[ruleNumber], defaultTimeout);
    break;
  case "poll":
    if (!checkSetting("BingoPartyFeatures", "Party poll", command))
      break;
    // Format of messages: From [MVP+] p0iS: !p poll long q/y/n/optional/opt/opt
    const pollMessage = messageToBroadcast;

    // Some basic checks on poll message validity. If a message contains less
    // than exactly 2 or more than 5 slashes ("/"), Hypixel is likely going to
    // reject it (minimum two poll options, max. 5), thus:
    let slashCharCount = 0;
    for (let i = 0; i < pollMessage.length; i++) {
      if (pollMessage[i] === '/') {
        slashCharCount++;
      }
    }
    logDebug("Party poll slashCharCount: '" + slashCharCount + "'");

    // Another check – Hypixel: "Each answer can only be 20 characters long."
    // (questions part can be longer, so we shift() the array once to discard it from this test)
    let portions = pollMessage.split('/');
    portions.shift();
    let answerLengthsValid = portions.every((portion) => {
      return portion.length <= 20;
    });

    // TODO: this is the boolean to update in case of adding new checks on
    // poll message validity, if it is to be made more sophisticated:
    const isValidPoll = (slashCharCount >= 2 && slashCharCount <= 5 && answerLengthsValid);

    if (!isValidPoll) {
      outputCommand(`r Hi ${rankRemovedSenderName}, what you sent wasn't a valid poll!`);
    } else {
      outputCommand(`p poll From ${formattedSenderName}: ${pollMessage}`);
    }
    break;
  case "g":
    // fallthrough for additional alias
  case "gd":
    // fallthrough for additional alias
  case "guide":
    // requires Discord integration/webhook connection, which is always
    // missing in the CT version
    if (usesChatTriggers) {
      break;
    }


    const guideLink = getBingoGuideLink();

    if (!guideLink) {
      // "contact aphased"
      outputCommand(`r No guide available - contact ${getNameByPermissionRank("botAccountOwner", allowlist)}`)
    } else {
        const currentTime = Date.now();
        if (currentTime - lastActionTimeGuidePosted >= THIRTY_SECONDS) {
          // wait a little to help readers process what's going on (this might be
          // removed)
          waitAndOutputCommand(`pc Guide: ${guideLink}`, 1500);
          lastActionTimeGuidePosted = currentTime;
        } else {
          logDebug("Not posting guide again. (<30s passed since last share message)");
        }
    }
    break;
  case "sg":
    // fallthrough for additional alias
  case "setguide":
    /* Bot administrator-only command: Manually set the link to the Bingo guide,
    i.e. the response to be output on `!p guide` (forum link to Indigo's post) */
    if (!isAccountOwner(rankRemovedSenderName, partyHostAccountOwners)) {
      replyUsage(rankRemovedSenderName);
      break;
    }
    setBingoGuideLink(commandArgument);
    log(`Set guide link to: '${commandArgument}'`);
    break;
  case "help":
    if (!checkSetting("BingoPartyFeatures", "!p help", command))
      break;
    /* The use of a couple different messages with essentially the same content
    is to prevent Hypixel's blocking of repeatedly sending the same in direct
    messages. For this, at least (?) three differing messages are needed. We
    cycle through all, and will never reach int limit, so no need to reset the
    counter. */
    outputCommand(helpMessages[helpOutputIndex % helpMessages.length]);
    helpOutputIndex++;
    break;
  case "add":
    /* Discord administrator-only functionality */
    // TODO: implement add (splashers) using manageData.mjs functions
    /*
    `/msg BingoParty !p add splasher:exact_IGN`
    `/msg BingoParty !p add alias:any_current_stored_IGN new_exact_IGN_1 new_exact_IGN_2`
    */
    break;
  case "removeSplasher":
    /* Discord administrator-only functionality */
    // TODO: implement removeSplasher using manageData.mjs functions
    /* `/msg BingoParty !p removeSplasher primary_IGN` */
    break;
  case "cmd":
    /* Bot administrator-only "undocumented" (when trying to use) command:
    will directly execute _whatever_ is received. Due to this being de facto
    equivalent to having direct (even if chat-only) access to the account, I
    will only let myself have this permission, since BingoParty is, in fact, my
    account. */
    if (!isAccountOwner(rankRemovedSenderName, partyHostAccountOwners)) {
      replyUsage(rankRemovedSenderName);
      break;
    }
    /* This has to include the exact message, the same as it would be "typed"
    by a player, _minus_ the preceding slash. Examples:
    `pc hello everybody`
    `setstatus online`
    `msg IGN <message>` */
    outputCommand(messageToBroadcast);
    break;
  default:
    /* The default case represents any non-valid command, thus we point towards
    the usage/help command since we know the attempt was sent by a user with
    command/party moderation permissions. */
    replyUsage(rankRemovedSenderName);
    logDebug("Default case activated, no party command ran");
    break;
  }

  logDebug("end of executeHypixelPartyCommand reached!");
}
