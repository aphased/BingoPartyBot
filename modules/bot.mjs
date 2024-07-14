import mineflayer from "mineflayer";
import chalk from "chalk";
import axios from "axios";
import stripAnsi from "strip-ansi";

import { log, logDebug, err } from "./utils.mjs";
import { parseAndExecuteMessage } from "./handleMessage.mjs";
import { bridgingToDiscordEnabled, onDataStdinHandler } from "../index.mjs";

// left in from Trypo (?):
// import { json } from "stream/consumers";
// import { parse } from "path";

import { allowlist, bingoBrewersRules } from './manageData.mjs';


export default class BingoPartyBot {
  bot;
  name;

  b_prefix = process.env.PARTY_BOT_PREFIX;

  botArgs = {
    host: 'mc.hypixel.net',
    version: '1.16.4', // seems to fix issues w/ chat length (long !p poll…s)
    // TODO: Bump game version in use – from a quick attempt to runs the bot
    // on Minecraft 1.20, for the time being, it did not seem to work w/o issues?
    username: process.env.MINECRAFT_EMAIL,
    auth: process.env.ACCOUNT_AUTH_TYPE
  };

  constructor(name) {
    this.bot = mineflayer.createBot(this.botArgs);
    this.name = name || "BingoPartyBot";

    // Attach listeners, moved the implementations out for clarity/overview:

    this.bot.once('login', () => {
      this.onceLogin();
    });

    this.bot.on('kicked', (reason, loggedIn) => {
      this.onKicked(reason, loggedIn);
    });

    this.bot.once('spawn', () => {
      this.onceSpawn();
    });

    // Never mind, better? temporary? solution: see !p ban command now (sharedCoreFunctionality file)
    // this.bot.on('spawn', () => {
    //   // TODO: 2024-07-01 emergency fix:
    //   // Hypixel have removed the ability to block (formerly ignore) 
    //   // add/remove/list/anything while the player positioned in Limbo.

    //   // BossFlea recommendation: wait 5 seconds, only then request location
    //   setTimeout(() => {
    //     this.runCommand("locraw");
    //   }, 5000);

    //   // figure out location…
    
    //   if (inLimbo) {
    //     this.runCommand("l");
    //     // AFK there instead of in Limbo
    //     this.runCommand("play sb");
    //   }
    // });

    this.bot.on('end', () => {
      this.onEnd();
    });

    this.bot.on('chat', (username, message) => {
      this.onChat(username, message);
    });

    this.bot.on('message', (message) => {
      // chat listener is implemented/added here
      this.onMessage(message);
    });
  }

  /**
   * Sends bot to limbo by posting section sign (illegal mc character)
   */
  sendToLimbo(){
    // The classic send-to-limbo approach was removed by Hypixel
    // sometime early 2024-07:
    // this.bot.chat("§");

    // The next best alternative: just spam commands and hope for the best?
    // Nope – oofy 2024-07-14: "sending multiple commands in the same
    // tick gets people banned" - removed again for the time being
    for (let i = 0; i < 10; i++) {
      // this.runCommand("snow");
      // Even better, oofy's discovery (hilarious):
      this.runCommand("thiscommandliterallydoesnothing");
    }

    // TODO: find a reliable, permanent way to implement sendToLimbo() that is
    // definitively at a risk of zero for getting banned by Hypixel

  }

  /**
   * @param {String} command  The chat command to be sent to Hypixel,
   * **without** preceding slash. This is also applicable for regular chat
   * messages, since they should always specify their respective channel
   * (e.g. `pc <message to party>`, `msg <ign> <direct message whisper>`, etc.)
   */
  runCommand(command){
    this.bot.chat("/" + command);
  };

  onceLogin() {
    let bSocket = this.bot._client.socket;
    const onceLoginMessage = chalk.ansi256(28)(`Connected to: ${bSocket.server ? bSocket.server : bSocket._host}`);
    log(onceLoginMessage);
    this.sendBridge(onceLoginMessage);

    logDebug("Checking access to data imports:"); // basic checks

    if (allowlist.length <= 1) err("Allowlist empty!");
    else {
      logDebug("First entry in playerNames (allowlist):");
      logDebug("'" + allowlist[0].names + "'");
    }

    if (bingoBrewersRules.length <= 1) err("Rules list empty!");
    else {
      logDebug("First entry in Discord rules:");
      logDebug("'" + bingoBrewersRules["1"] + "'");
    }
  }

  // onKicked(reason, loggedIn) {
  onKicked(reason) {
    const onKickedMessage = chalk.ansi256(196)(`Bot kicked! Reason:\n${reason}`)
    log(onKickedMessage);
    this.sendBridge(onKickedMessage);
    this.#removeListener();
    // For kicks because of proxy reboots ("{"extra":[{"color":"red","text":"This proxy is being rebooted. Please join back under "},{"color":"aqua","text":"mc.hypixel.net"},{"color":"red","text":"!"}],"text":""}"):
    this.bot.end(); // TODO: does this finally work as intended?
  }

  onceSpawn() {
    this.bot.waitForTicks(22);
    this.sendToLimbo();
    this.bot.waitForTicks(8);
    // (maybe) TODO: What if not currently in a party yet? Check first (/pl)?
// Temporarily? removed 2024-07-01:
    // log("Sending \"back online\" message.")
    // this.runCommand("pc Back online.");
    // // From this the results are either
    // // `Party > BingoParty: Back online.`, or
    // // `You are not in a party right now.`
  }

  onEnd() {
    const onEndMessage = chalk.ansi256(196)("Bot disconnected.");
    log(onEndMessage);
    this.sendBridge(onEndMessage);
    this.#removeListener();
  }

  onChat(username, message) {
    // for the time being (so as to not spam the logs):
    return;
    // yyyy-mm-dd hh:mm:ss
    //const date = new Date().toISOString().replace(/T|Z/g, ' ').slice(0, -5);
    //console.log(chalk.ansi256(29)(date, " [CHAT]"), username, message);
  }

  /**
   * Core of the bot's functionality begins here, by attaching to the chat.
   */
  onMessage(message) {
    // pass custom ansi codes for enabling color formatting in Discord bridge;
    // leave out timestamp when sending message to Discord
    let messageString = message.toAnsi(undefined, this.#customAnsiCodes);
    // yyyy-mm-dd hh:mm:ss
    const date = new Date().toISOString().replace(/T|Z/g, ' ').slice(0, -5);
    let logMessage = chalk.ansi256(28)(date, "[MSG] ") + messageString;
    console.log(logMessage);

    // message still includes ANSI formatting here
    const rawTextMessage = stripAnsi(messageString);
    if (this.#bridgeMessageRegex.test(rawTextMessage)) {
      /* don't send to Discord:
        - empty lines and "------…" lines from `/pl`, `/g online` etc.
        - "You were spawned in Limbo"
        - "has joined the lobby!"
        - "You have {n} unclaimed leveling rewards!"
        - "You tipped {n} players in {m} different games!"
        - or other message types like that
      … might have to change this from positive list to just blocking some types
      */
      this.sendBridge(messageString, this.#bridgeWebhookURL, this.#messageQueueBridge);
    } else if (this.#partyMemberEventRegex.test(rawTextMessage)) {
      // Regex ordering/using else if is important here: we don't want copy-
      // pasted to chat, repeated join/leave/kick etc. messages to show up as a 
      // join/leave/etc. event, so matching "Party > " has to take priority
      
      // use different webhook for p join/leave/went offline/kick messages
      // (and different Discord channel)
      this.sendBridge(messageString, this.#playerEventWebhookURL, this.#messageQueuePlayerEvents);
    } else if (this.#partyMemberKickedRegex.test(rawTextMessage)) {
      // send to both as a way to implement BossFlea's request/suggestion of
      // seeing at least the kicks in #bridge in addition to #player-join-leave
      this.sendBridge(messageString, this.#bridgeWebhookURL, this.#messageQueueBridge);
      this.sendBridge(messageString, this.#playerEventWebhookURL, this.#messageQueuePlayerEvents);
    }

    // Delegate the actual bot/core functionality to other modules for (hopefully) clarity:
    parseAndExecuteMessage(message);
  }


  /**
   * Provoke full program exit (& auto-restart, when executed via run-bot)
   * by stopping listening to stdin (handler was added in `../index.mjs`)
   */
  #removeListener() {
    process.stdin.removeListener('data', onDataStdinHandler);
    // see https://stackoverflow.com/a/59222789 and
    // https://github.com/nodejs/node-v0.x-archive/issues/17204:
    process.stdin.pause();
  }


  // Discord/Webhook stuff starts here, to be interfaced with using 
  // BingoPartyBot.sendBridge(), everything else as private functions.

  // URL format is Discord's; also see file dot_env_template
  #bridgeWebhookURL = process.env.WEBHOOK_URL_BRIDGE; // const
  #playerEventWebhookURL = process.env.WEBHOOK_URL_PLAYER_EVENTS; // const
  #messageQueueBridge = []; // const
  #messageQueuePlayerEvents = []; // const
  #isProcessing = false; // let

  // const
  // TODO: optimize this list for unique strings once it's been finalized
  // TODO: move has promoted|has demoted|is now a Party Moderator into separate,
  // third category to keep track of current moderator list?
  #bridgeMessageRegex = /(Party > |From|To|You cannot say the same message twice!|Connected to|Bot kicked!|Bot disconnected.|You have joined|The party is now|The party is no longer|has promoted|has demoted|is now a Party Moderator|The party was transferred|disbanded|You are not allowed to disband this party.|Party Members|Party Leader|Party Moderators|You have been kicked from the party by|You are not in a party right now.|You are not currently in a party.|That player is not online!|Created a public party! Players can join with \/party join|Party is capped at|Party Poll|Invalid usage!|created a poll! Answer it below by clicking on an option|Question:|The poll|You cannot invite that player since they're not online.|You are not allowed to invite players.|enabled All Invite|to the party! They have 60 seconds to accept.|is already in the party.|You'll be partying with:)/;
  #partyMemberEventRegex = /(left the party.|joined the party.|disconnected, they have 5 minutes to rejoin before they are removed from the party.|was removed from your party because they disconn)/;
  #partyMemberKickedRegex = /(has been removed from the party.)/;
  

  /**
   * Wrapper function to use for interacting with bridge/Discord message sending.
   * @param {string} messageContent String to be sent to a Discord channel,
   * including ANSI codes for colorful text.
   * @param {string} webhookURL  URL to use for the Discord webhook
   * @param {string} messageQueue  Array to store/queue messages in
   * @returns {void} TODO: return boolean based on some add-to-queue or even 
   * sending success?
   */
  sendBridge(messageContent, webhookURL, messageQueue) {
    if (!bridgingToDiscordEnabled[0]) {
      return;
    }
    
    if (!webhookURL) {
      // (JS 101: the string is either empty, undefined,
      // or null; an empty string is also falsy)
      // => assume no bridge/webhook is configured
      logDebug("No bridge (webhook URL) currently defined.");
      return;
    }

    // "Don't send all messages individually, at once" implementation
    // so as to not immediately hit Discord's rate limit
    this.#addMessageToQueue(messageContent, webhookURL, messageQueue);
  }

  #addMessageToQueue(message, webhookURL, messageQueue) {
    // this.#messageQueue.push(message);
    messageQueue.push(message);
    this.#processQueue(webhookURL, messageQueue);
  }


  async #processQueue(webhookURL, messageQueue) {
    // TODO: if we commit to the rather very ugly solution of maintaining
    // separate message queues per channel/webhook type, there also needs to be a
    // separate lock…
    // This is not a high-speed finance application, but it's still a bug/bad 
    // implementation and probably unnecessary performance hit.
    if (this.#isProcessing) return;

    this.#isProcessing = true;

    // while (this.#messageQueue.length > 0) {
    while (messageQueue.length > 0) {
      // Take up to 5 messages to form one "embed"
      // const chunk = this.#messageQueue.splice(0, 5);
      const chunk = messageQueue.splice(0, 5);

      let messageContent = "```ansi\n";
      chunk.forEach((msg) => {
          messageContent += msg + "\n";
      });
      messageContent += "```";

      const payload = {
        content: messageContent
      };

      try {
        await axios.post(webhookURL, payload);
      } catch (error) {
        console.error('Error sending message:', error);
        // If rate limited by Discord, requeue the messages and wait
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers['retry-after'] * 1000;
          messageQueue.unshift(...chunk);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        }
      }

      // Wait for 2 seconds before processing the next batch
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.#isProcessing = false;
  }

  /**
   * Adapted from node_modules/prismarine-chat/index.js, line 12, by replacing
   * all values in the 9x range with the equivalent 3x value; reason for this
   * being that Discord as of 2024-06 does not support those, unfortunately, in
   * their ANSI codeblock highlighting implementation.
   */
  #customAnsiCodes = { // const
    '§0': '\u001b[30m',
    '§1': '\u001b[34m',
    '§2': '\u001b[32m',
    '§3': '\u001b[36m',
    '§4': '\u001b[31m',
    '§5': '\u001b[35m',
    '§6': '\u001b[33m',
    '§7': '\u001b[37m',
    // The following were 90-range values in the default Ansi codes
    '§8': '\u001b[30m',
    '§9': '\u001b[34m',
    '§a': '\u001b[32m',
    '§b': '\u001b[36m',
    '§c': '\u001b[31m',
    '§d': '\u001b[35m',
    '§e': '\u001b[33m',
    '§f': '\u001b[37m',
    // … until here
    '§l': '\u001b[1m',
    '§o': '\u001b[3m',
    '§n': '\u001b[4m',
    '§m': '\u001b[9m',
    '§k': '\u001b[6m',
    '§r': '\u001b[0m'
  }


}

