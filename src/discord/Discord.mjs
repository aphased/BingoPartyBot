/*
 *
 *
 * The much needed Discord bot rewrite has now arrived!!
 *
 *
 */
import { Client, GatewayIntentBits } from "discord.js";
import Config from "../../Config.mjs";
import loadDiscordCommands, { registerCommands } from "./handlers/CommandHandler.mjs";
class Discord {
  constructor() {
    this.config = Config;
    if (this.config.discordBotInfo.token) {
      this.bot = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });
      this.bot.login(this.config.discordBotInfo.token);
      this.clientReady = this.clientReady.bind(this);
      this.interactionCreate = this.interactionCreate.bind(this);
      this.bot.once("ready", this.clientReady);
      this.bot.on("interactionCreate", this.interactionCreate)
    } else {
      this.disabled = true; // Disable the bot if no token is provided (idk when this will be needed but why not)
    }
  }

  /**
   *
   * @param {import("../utils/Utils.mjs").utils} util
   */
  setUtils(utils) {
    /** @type {import("../utils/Utils.mjs").utils} */
    this.utils = utils;
  }

  setConfig(config) {
    this.config = config;
  }

  async clientReady(bot) {
    console.log(`Discord bot ready! Logged in as ${bot.user.tag}`);
    this.commands = await loadDiscordCommands();
    await registerCommands(bot, Config.discordBotInfo.token, this.commands);
  }

  async interactionCreate(interaction) {
    if (!interaction.isCommand()) return;
    const command = this.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(this, interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
  }
}
const discordBot = new Discord();
export default discordBot;
