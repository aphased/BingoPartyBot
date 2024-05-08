import mineflayer from "mineflayer";
import chalk from "chalk";
import { logDebug, log, err } from './utils.mjs';
import { parseAndExecuteMessage } from './handleMessage.mjs';
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
    log(chalk.ansi256(28)(`Connected to: ${bSocket.server ? bSocket.server : bSocket._host}`));

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

  onKicked(reason, loggedIn) {
    log(chalk.ansi256(196)(`Bot kicked! Reason:\n${reason}`));
    removeListener();
  }

  onceSpawn() {
    this.bot.waitForTicks(22);
    this.sendToLimbo();
    this.bot.waitForTicks(8);
    // (maybe) TODO: What if not currently in a party yet?
    log("Sending \"back online\" message.")
    // Either `Party > BingoParty: Back online.`  or
    // `You are not in a party right now.`        from this:
    this.runCommand("pc Back online.");
  }

  onEnd() {
    log(chalk.ansi256(196)("Bot disconnected."));
    removeListener();
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
    // yyyy-mm-dd hh:mm:ss
    const date = new Date().toISOString().replace(/T|Z/g, ' ').slice(0, -5);
    console.log(chalk.ansi256(28)(date, "[MSG] "), message.toAnsi());

    parseAndExecuteMessage(message);
  }

}

/**
 * Provoke full program exit (& auto-restart, when executed via run-bot)
 * by stopping listening to stdin (handler was added in `../index.mjs`)
 */
function removeListener() {
  process.stdin.removeListener('data', onDataStdinHandler);
}
