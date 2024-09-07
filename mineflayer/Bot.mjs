import mineflayer from "mineflayer";
import loadPartyCommands from "./handlers/PartyCommandHandler.mjs";
import * as config from "../Config.mjs";

class Bot {
  constructor() {
    this.config = config.default;
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
    this.refreshConfig();
  }

  // Used to refresh allowList every 10 seconds
  refreshConfig() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../Config.mjs?cacheBust=${Date.now()}`
        );
        this.config = configModule.default; // Access the default export of the JSON module
        // DEBUG: console.log("Allowlist updated:", allowlist);
      } catch (error) {
        console.error("Error updating allowlist:", error);
      }
    }, 10000);
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
