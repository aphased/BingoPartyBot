import mineflayer from "mineflayer";
import * as config from "../../Config.mjs";
import loadPartyCommands from "./handlers/PartyCommandHandler.mjs";

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
    this.bot.once("spawn", this.onceSpawn.bind(this));
    // this.bot.addListener("end", this.onEnd.bind(this));
    // this.bot.addListener("chat", this.onChat.bind(this));
    this.bot.addListener("message", this.onMessage.bind(this));
  }

  username = bot.username;

  /**
   * @param {String} message
   */
  chat(message) {
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
   * @param {String} recipient  IGN to send a message to (currently not needed,
   * but try to supply this value).
   * @param {String} message  Message to send.
   */
  reply(recipient, message) {
    // alternative (currently unused):
    // this.chat(`w ${sender} ${this.utils.addRandomString(message)}`);
    this.chat(`/r ${this.utils.addRandomString(message)}`);
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
    this.utils.setMonthGuide({ link: this.config.guideLink });
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

  onceSpawn() {
    this.bot.waitForTicks(22);
    this.bot.chat("/limbo");
    this.bot.waitForTicks(8);
  }
}

const myBot = new Bot();

export default myBot;
