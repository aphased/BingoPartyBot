import mineflayer from "mineflayer";
import path from "path";
import { fileURLToPath } from "url";
import * as config from "../../Config.mjs";
import BingoSchedule from "./BingoSchedule.mjs";
import loadPartyCommands from "./handlers/PartyCommandHandler.mjs";
import { SenderType, VerbosityLevel } from "../utils/Interfaces.mjs";
import Utils from "../utils/Utils.mjs";

export const MC_VERSION = "1.21.11";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_AUTH_CACHE_FOLDER = path.resolve(__dirname, "../../.auth-cache");
const DEFAULT_MICROSOFT_AUTH_OPTIONS = {
  flow: "sisu",
  authTitle: "00000000402b5328",
  deviceType: "Win32",
};

class Bot {
  constructor() {
    this.config = config.default;
    this.verbosityLevel = this.config.verbosityMc;
    this.bot = null;
    this.isConnecting = false;
    this.isReconnecting = false;
    this.intentionalDisconnect = false;
    this.reconnectTimeout = null;
    this.bingoSchedule = new BingoSchedule({ logger: this });
  }

  log(message, type = "Info") {
    if (this.utils) this.utils.log(message, type);
    else console.log(`[${type}] ${message}`);
  }

  createMineflayerBot() {
    /**
     * The Mineflayer bot on Hypixel.
     */
    this.bot = mineflayer.createBot({
      host: "mc.hypixel.net",
      version: MC_VERSION,
      hideErrors: true,
      logErrors: false,
      ...this.getAccountAuthOptions(),
    });

    this.attachListeners();
  }

  getAccountAuthOptions() {
    const options = {
      username: this.config.mineflayerInfo.email,
      auth: this.config.mineflayerInfo.authType,
    };

    if (this.config.mineflayerInfo.authType !== "microsoft") return options;

    return {
      ...options,
      profilesFolder: DEFAULT_AUTH_CACHE_FOLDER,
      ...DEFAULT_MICROSOFT_AUTH_OPTIONS,
      ...this.config.mineflayerInfo.microsoftAuth,
    };
  }

  attachListeners() {
    this.bot.once("login", this.onceLogin.bind(this));
    this.bot._client.once(
      "success",
      this.sendInitialConfigurationSettings.bind(this),
    );
    this.bot.addListener("kicked", this.onKicked.bind(this));
    this.bot.addListener("spawn", this.onSpawn.bind(this));
    this.bot.addListener("end", this.onEnd.bind(this));
    this.bot.addListener("message", this.onMessage.bind(this));
    this.bot.addListener("error", this.onError.bind(this));
  }

  sendInitialConfigurationSettings() {
    setTimeout(() => {
      const client = this.bot?._client;
      if (!client || client.state !== "configuration") return;

      client.write("settings", {
        locale: "en_US",
        viewDistance: 12,
        chatFlags: 0,
        chatColors: true,
        skinParts: 0x7f,
        mainHand: 1,
        enableTextFiltering: false,
        enableServerListing: true,
        particleStatus: "all",
      });
    }, 10);
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
    if (!this.bot) {
      this.log(
        `Unable to send chat while Minecraft bot is disconnected: ${message}`,
        "Warn",
      );
      return;
    }
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
    this.utils?.emitRuntimeEvent({
      source: "minecraft",
      kind: "command",
      level: "info",
      text: message,
      metadata: {
        direction: "outbound",
        transport: "minecraft-chat",
      },
    });
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
    if (this.utils?.debug?.debug)
      this.utils.emitRuntimeEvent({
        source: "system",
        kind: "debug",
        level: "debug",
        text: `Replying to ${sender.username} with message: ${message}`,
        metadata: {
          sender,
        },
      });
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

  setRuntimeEvents(runtimeEvents) {
    this.runtimeEvents = runtimeEvents;
    this.bingoSchedule.logger = this;
  }

  setConfig(config) {
    this.config = config;
    this.verbosityLevel = this.config.verbosityMc;
    if (this.config.guideLink)
      this.utils.setMonthGuide({ link: this.config.guideLink });
    this.utils.webhookLogger.setWebhooks(this.config.webhooks);

    if (this.config.bingoSchedule?.enabled) {
      this.bingoSchedule.setBot(this);
      this.bingoSchedule.configure(this.config.bingoSchedule);
      if (this.bingoSchedule.isRunning()) this.bingoSchedule.manageConnection();
      else this.bingoSchedule.start();
    } else {
      this.bingoSchedule.stop();
      this.connect({ immediate: true, reason: "Bingo schedule disabled" });
    }
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
    this.isConnecting = false;
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

  connect({ immediate = false, reason = "Connect requested" } = {}) {
    if (this.isConnected() || this.isConnecting) return;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.intentionalDisconnect = false;
    if (immediate) {
      this.log(reason, "Info");
      this.reconnectNow();
      return;
    }

    this.scheduleReconnect(reason);
  }

  disconnect(reason = "Disconnect requested") {
    this.intentionalDisconnect = true;
    this.cancelReconnect(reason);

    if (!this.bot) return;
    this.log(reason, "Info");
    this.bot.quit(reason);
  }

  cancelReconnect(reason = "Reconnect cancelled") {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
      this.log(reason, "Info");
    }
    this.isReconnecting = false;
  }

  isConnected() {
    if (!this.bot?._client) return false;
    const socketState = this.bot._client.socket?.readyState;
    if (!socketState) return false;
    return socketState !== "closed" && socketState !== "closing";
  }

  scheduleReconnect(reason = "Reconnect requested", logLevel = "Warn") {
    if (this.isReconnecting || this.intentionalDisconnect) return;
    this.isReconnecting = true;

    const delay = 35_000 + Math.random() * 10_000;
    const delaySeconds = Math.round(delay / 1000);
    this.log(`${reason}. Reconnecting in ${delaySeconds}s`, logLevel);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectNow();
    }, delay);
  }

  reconnectNow() {
    this.cleanupBot();
    this.isConnecting = true;
    this.isReconnecting = false;
    this.createMineflayerBot();
  }

  cleanupBot() {
    if (!this.bot) return;
    this.bot.removeAllListeners();
    this.bot._client?.removeAllListeners();
    this.bot._client?.socket?.destroy();
    this.bot = null;
  }

  onEnd(reason) {
    this.isConnecting = false;
    const message = reason?.toString?.() ?? "";

    if (this.intentionalDisconnect) {
      this.log(`Minecraft bot disconnected intentionally: ${message}`, "Info");
      this.cleanupBot();
      return;
    }

    this.cleanupBot();
    if (this.isTransientDisconnect(message)) {
      this.scheduleReconnect(
        `Minecraft bot disconnected: ${message || "unknown reason"}`,
        this.shouldQuietlyReconnect(message) ? "Info" : "Warn",
      );
      return;
    }

    this.log(`Minecraft bot ended: ${message || "unknown reason"}`, "Error");
    process.exit(1);
  }

  onError(error) {
    const message = error?.message ?? error?.toString?.() ?? "Unknown error";
    this.log(`Minecraft bot error: ${message}`, "Error");
  }

  isTransientDisconnect(reason) {
    const normalized = reason.toLowerCase();
    return (
      !reason ||
      normalized.includes("socketclosed") ||
      normalized.includes("econnreset") ||
      normalized.includes("socket closed") ||
      normalized.includes("timed out") ||
      normalized.includes("timeout")
    );
  }

  shouldQuietlyReconnect(reason) {
    const normalized = reason.toLowerCase();
    return !reason || normalized.includes("socketclosed");
  }

  getStatusSnapshot() {
    return {
      enabled: !this.config?.debug?.disableMinecraft,
      connected: this.isConnected(),
      connecting: this.isConnecting,
      reconnecting: this.isReconnecting,
      username: this.getUsername(),
      verbosityLevel: this.verbosityLevel,
    };
  }
}

const myBot = new Bot();

export default myBot;
