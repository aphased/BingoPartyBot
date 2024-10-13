import mineflayer from "mineflayer";
import * as config from "../../Config.mjs";
import loadPartyCommands from "./handlers/PartyCommandHandler.mjs";
import { SenderType } from "../utils/Interfaces.mjs";

class Bot {
  constructor() {
    this.config = config.default;
    /**
     * The Mineflayer bot on Hypixel.
     */
    this.bot = mineflayer.createBot({
      host: "mc.hypixel.net",
      username: this.config.mineflayerInfo.email,
      version: "1.20.1",
      auth: this.config.mineflayerInfo.authType,
    });

    (async () => {
      /** @type {Collection} */
      this.partyCommands = await loadPartyCommands();
    })();

    this.bot.once("login", this.onceLogin.bind(this));

    this.bot.addListener("kicked", this.onKicked.bind(this));
    this.bot.addListener("spawn", this.onSpawn.bind(this));
    // this.bot.addListener("end", this.onEnd.bind(this));
    // this.bot.addListener("chat", this.onChat.bind(this));
    this.bot.addListener("message", this.onMessage.bind(this));
  }

  /**
   * This central function is directly or indirectly called whenever anything
   * is output to Minecraft chat. Before outputting the message, some security/
   * safety checks are performed (see below within function implementation for
   * details).
   * @param {String} message
   */
  chat(message) {
    // Escape potential injections that could ping users etc. on Discord by
    // escaping all ` (backticks) with ‵ ("reversed prime", U+2035)
    message = message.replace(/`/g, "‵");
    // Check message length limit, if it is too long, only perform a cut off
    // – ideally the caller ensures this property already so that it can be
    // handled more gracefully than sending out a probably incomplete chat
    // message.
    message = message.substring(0, 255);
    this.bot.chat(message);
  }

  /**
   * Use this function anytime you want to send a message via Hypixel's `/r`.
   * Currently, the recipient is unused anyway, so if they're unknown, pass an
   * empty string (`""`).
   * The `reply` function will add on a randomizing part at the end of the
   * message string in order to enable repeated output/sending of the same
   * direct message (womp womp Hypixel).
   *
   * Due to direct message privacy settings, this implementation currently
   * exclusively uses the `/reply` mechanism in favor of `/msg` (=`/whisper`).
   * Advantage is being able to reply to anybody, at the cost of potentially
   * answering the wrong message to an incorrect recipient with quick
   * back-to-back commands/messages received.

   * Thus, this use may change in the future, at which point including the
   * recipient's info (i.e. IGN) will be necessary.
   * @param {Object} sender  IGN to send a message to (currently not needed,
   * @param {String} [sender.username]
   * @param {String} [sender.preferredName]
   * @param {String} [sender.commandName]
   * @param {String} [sender.type]
   * @param {String} [sender.discordReplyId]
   * but try to supply this value).
   * @param {String} message  Message to send.
   */
  reply(sender, message) {
    if (this.utils.debug)
      console.log(`Replying to ${sender.username} with message: ${message}`);
    // alternative (currently unused):
    // this.chat(`w ${recipient} ${this.utils.addRandomString(message)}`);
    if (sender.type === SenderType.Minecraft)
      this.chat(`/r ${this.utils.addRandomString(message)}`);
    else if (sender.type === SenderType.Discord) {
      this.utils.discordReply
        .getReply(sender.discordReplyId)
        .editReply(message);
      this.utils.discordReply.removeReply(sender.discordReplyId);
    } else if (sender.type === SenderType.Console) {
      this.utils.log(message, "Info");
    }
  }

  async reloadPartyCommands() {
    this.partyCommands = await loadPartyCommands();
    return true;
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
    this.utils.webhookLogger.setWebhooks(this.config.webhook.bridge);
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
    await new Promise((resolve) =>
      setTimeout(resolve, this.utils.minMsgDelay * 3),
    );
    this.bot.chat("/locraw");
  }
}

const myBot = new Bot();

export default myBot;
