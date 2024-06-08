import mineflayer from "mineflayer";
import chalk from "chalk";
import axios from "axios";
import stripAnsi from "strip-ansi";

import { log, logDebug, err } from "./utils.mjs";
import { parseAndExecuteMessage } from "./handleMessage.mjs";
import { onDataStdinHandler } from "../index.mjs";

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
    this.bot.chat("§");
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
  }

  onceSpawn() {
    this.bot.waitForTicks(22);
    this.sendToLimbo();
    this.bot.waitForTicks(8);
    // (maybe) TODO: What if not currently in a party yet? Check first (/pl)?
    log("Sending \"back online\" message.")
    this.runCommand("pc Back online.");
    // From this the results are either
    // `Party > BingoParty: Back online.`, or
    // `You are not in a party right now.`
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

    // TODO: optimize this list for unique strings once it's been finalized
    const bridgeMessageRegex = /(Party > |From|To|You cannot say the same message twice!|Connected to|Bot kicked!|Bot disconnected.|You have joined|The party is now|The party is no longer|has been removed from the party.|has promoted|has demoted|is now a Party Moderator|The party was transferred|disbanded|Party Members|Party Leader|Party Moderators|You have been kicked from the party by|You are not in a party right now.|You are not currently in a party.|Created a public party! Players can join with \/party join|Party is capped at)/;
    // message still includes ANSI formatting here
    if (bridgeMessageRegex.test(stripAnsi(messageString))) {
      /* don't send to Discord:
        - empty lines and "------…" lines from `/pl`, `/g online` etc.
        - "You were spawned in Limbo"
        - "has joined the lobby!"
        - or other message types like that
      … might have to change this from positive list to just blocking some types
      */
      this.sendBridge(messageString);
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
  #webhookURL = process.env.WEBHOOK_URL_BRIDGE; // const
  #messageQueue = []; // const
  #isProcessing = false; // let

  /**
   * Wrapper function to use for interacting with bridge/Discord message sending.
   * @param {string} messageContent String to be sent to a Discord channel,
   * including ANSI codes for colorful text.
   * @returns {void} TODO: return boolean based on some add-to-queue or even 
   * sending success?
   */
  sendBridge(messageContent) {
    if (!this.#webhookURL) {
      // (JS 101: the string is either empty, undefined,
      // or null; an empty string is also falsy)
      // => assume no bridge/webhook is configured
      logDebug("No bridge defined.");
      return;
    }

    // "Don't send all messages individually, at once" implementation
    // so as to not immediately hit Discord's rate limit
    this.#addMessageToQueue(messageContent);
  }

  #addMessageToQueue(message) {
    this.#messageQueue.push(message);
    this.#processQueue();
  }


  async #processQueue() {
    if (this.#isProcessing) return;

    this.#isProcessing = true;

    while (this.#messageQueue.length > 0) {
      // Take up to 5 messages to form one "embed"
      const chunk = this.#messageQueue.splice(0, 5);

      let messageContent = "```ansi\n";
      chunk.forEach((msg) => {
          messageContent += msg + "\n";
      });
      messageContent += "```";

      const payload = {
        content: messageContent
      };

      try {
        await axios.post(this.#webhookURL, payload);
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
   *all values in the 9x range with the equivalent 3x value
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

