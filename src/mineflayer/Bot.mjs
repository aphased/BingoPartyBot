import mineflayer from "mineflayer";
import * as config from "../../Config.mjs";
import loadPartyCommands from "./handlers/PartyCommandHandler.mjs";
import { SenderType, VerbosityLevel } from "../utils/Interfaces.mjs";
import Utils from "../utils/Utils.mjs";

class Bot {
  constructor() {
    this.config = config.default;
    this.verbosityLevel = this.config.verbosityMc;
    /**
     * The Mineflayer bot on Hypixel.
     */
    this.bot = mineflayer.createBot({
      host: "mc.hypixel.net",
      username: this.config.mineflayerInfo.email,
      version: "1.20.1",
      auth: this.config.mineflayerInfo.authType,
    });

    this.bot.once("login", this.onceLogin.bind(this));

    this.bot.addListener("kicked", this.onKicked.bind(this));
    this.bot.addListener("spawn", this.onSpawn.bind(this));
    // this.bot.addListener("end", this.onEnd.bind(this));
    // this.bot.addListener("chat", this.onChat.bind(this));
    this.bot.addListener("message", this.onMessage.bind(this));
  }

  /**
   * This is the bot account's Minecraft IGN. It is initialized in the
   * OnceLogin.mjs mineflayer event handling using the setter function below.
   */
  #username = "";

  /**
   * This function sets the bot account's Minecraft IGN while making sure it is
   * always defined (falls back to the value "BingoParty").
   *
   * @param {string} ign - The Minecraft IGN to set for the bot account.
   */
  setUsername(ign) {
    this.#username = ign || this.#username || "BingoParty";
  }

  /**
   * Retrieves the bot accounts's Minecraft IGN.
   * @returns {string} The in-game username.
   */
  getUsername() {
    return this.#username;
  }

  /**
   * This central function is directly or indirectly called whenever anything
   * is output to Minecraft chat. Before outputting the message, some security/
   * safety checks are performed (see below within function implementation for
   * details).
   * @param {String} message
   * @param {Number} requiredVerbosity necessary verbosity setting to send message, defaults to `VerbosityLevel.Full`
   */
  chat(message, requiredVerbosity = VerbosityLevel.Full) {
    if (
      this.verbosityLevel < requiredVerbosity &&
      ["/pc ", "/r ", "/msg ", "/w "].some((cmd) => message.startsWith(cmd))
    )
      return;
    message = this.utils.replaceColorlessEmotes(message);
    // Check message length limit, if it is too long, only perform a cut off
    // – ideally the caller ensures this property already so that it can be
    // handled more gracefully than sending out a probably incomplete chat
    // message.
    message = message.substring(0, 255);
    this.bot.chat(message);
  }

  /**
   * Use this function anytime you want to send a message via Hypixel's `/r`.
   *
   * The `reply` function will add on a randomizing part at the end of the
   * message string in order to enable repeated output/sending of the same
   * direct message (womp womp Hypixel).
   *
   * Due to direct message privacy settings, this implementation currently
   * exclusively uses the `/reply` mechanism in favor of `/msg` (=`/whisper`).
   * The advantage is being able to reply to anybody, at the cost of potentially
   * answering the wrong message to an incorrect recipient with quick
   * back-to-back commands/messages received.
   *
   * If configured, it will also log the reply to a command sent via Discord,
   * also sending the reply out to Discord as one would expect (as opposed to
   * always in-game). Same procedure for commands sent from the bot console.
   *
   * @param {Object} sender  IGN to send a message to
   * @param {String} [sender.username]
   * @param {String} [sender.preferredName]
   * @param {String} [sender.commandName]
   * @param {String} [sender.type]
   * @param {String} [sender.discordReplyId]
   * @param {String} message  Message to send.
   * @param {Number} requiredVerbosity necessary verbosity setting to send message (only applies to minecraft replies)
   */
  reply(sender, message, requiredVerbosity) {
    if (this.utils.debug)
      console.log(`Replying to ${sender.username} with message: ${message}`);
    // alternative (currently unused):
    // this.chat(`w ${recipient} ${this.utils.addRandomString(message)}`);
    if (sender.type === SenderType.Minecraft)
      this.chat(`/r ${this.utils.addRandomString(message)}`, requiredVerbosity);
    else if (sender.type === SenderType.Discord) {
      // log message reply (like with a hypixel dm reply)
      this.onMessage(
        new Utils.CustomMessage(
          `[35mTo [34m[DISCORD] ${sender.username}[37m: ${message}[0m`,
          true,
        ),
      );
      this.utils.discordReply.sendReply(sender.discordReplyId, message);
    } else if (sender.type === SenderType.Console) {
      // log message reply (like with a hypixel dm reply)
      this.onMessage(
        new Utils.CustomMessage(
          `[35mTo [31m[CONSOLE] ${this.getUsername()}[37m: ${message}[0m`,
        ),
      );
      this.utils.log(message, "Info");
    }
  }

  async reloadPartyCommands() {
    this.partyCommands = await loadPartyCommands();
    return true;
  }

  async loadCommands() {
    this.partyCommands = await loadPartyCommands();
    if (this.config.persistentDisabledCommands)
      this.partyCommands = this.utils.loadStoredCommandStates(
        this.partyCommands,
      );
  }

  /**
   *
   * @param {import("../utils/Utils.mjs").utils} util
   */
  setUtilClass(util) {
    this.utils = util;
  }

  setConfig(config) {
    this.config = config;
    if (this.config.guideLink)
      this.utils.setMonthGuide({ link: this.config.guideLink });
    this.utils.webhookLogger.setWebhooks(this.config.webhooks);
  }

  /*
 * To add a new event, create a new file in the events folder and import it in the Bot class.
 * Always import using the following format:
    const configModule = await import(
      `./events/<FILE NAME>.mjs?cacheBust=${Date.now()}`
    );
    configModule.default.execute(<ARGUMENTS>);
 * This is to allow hot reloading of events. For the event itself just follow the format of the other events. Make a new
 * async function with the name of the event and call it in the constructor of the Bot class.
*/

  async onceLogin() {
    const configModule = await import(
      `./events/OnceLogin.mjs?cacheBust=${Date.now()}`
    );
    configModule.default.execute(this);
  }

  async onKicked(reason, loggedIn) {
    const configModule = await import(
      `./events/OnKick.mjs?cacheBust=${Date.now()}`
    );
    configModule.default.execute(this, reason, loggedIn);
  }

  async onMessage(message) {
    const configModule = await import(
      `./events/MessageEvent.mjs?cacheBust=${Date.now()}`
    );
    configModule.default.execute(message, this);
  }

  async onSpawn() {
    await this.utils.delay(this.utils.minMsgDelay * 3);
    this.bot.chat("/locraw");
  }
}

const myBot = new Bot();

export default myBot;
