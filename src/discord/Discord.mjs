/*
 *
 *
 * The much needed Discord bot rewrite has now arrived!!
 *
 *
 */
import { Client, GatewayIntentBits } from "discord.js";
import Config from "../../Config.mjs";
import loadDiscordCommands, {
  registerCommands,
} from "./handlers/CommandHandler.mjs";
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
      this.bot.on("interactionCreate", this.interactionCreate);
      if (this.config?.discordBotInfo?.guideChannel) {
        setInterval(
          () => this.checkBingoMessage(this.config.discordBotInfo.guideChannel),
          10000
        );
      }
    } else {
      this.disabled = true; // Disable the bot if no token is provided (idk whe n this will be needed but why not)
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
    if (command.permission) {
      let discord = this.utils.getUserObject({
        discord: interaction.user.id,
      });
      if (!discord)
        return interaction.reply({
          content:
            "You are not allowed to use this command! If you believe this is an error contact an administrator and/or make sure your account is linked to your minecraft account.",
          ephemeral: true,
        });
      if (command.permission > discord.permissionRank)
        return interaction.reply({
          content:
            "You are not allowed to use this command! If you believe this is an error contact an administrator and/or make sure your account is linked to your minecraft account.",
          ephemeral: true,
        });
    }
    try {
      await command.execute(this, interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }

  async checkBingoMessage(channelId) {
    /** @type {import("discord.js").Channel} */
    const channel = await this.bot.channels.fetch(channelId);
    // console.log(channel)
    if (!channel.isTextBased()) return;
    const messages = await channel.messages.fetch({
      limit: 1,
    });
    let message = messages.first();
    let messageTimeStamp = new Date(message.createdTimestamp);
    let currentTimeStamp = new Date();
    if (messageTimeStamp.getMonth() !== currentTimeStamp.getMonth()-1) return;
    if (/^(https:\/\/hypixel\.net\/threads\/bingo)/.test(message.content)) {
      let guide = this.utils.getMonthGuide();
      if (!guide) {
        this.utils.setMonthGuide({ link: message.content, time: (messageTimeStamp.getMonth()+2) + "/" + messageTimeStamp.getFullYear() });
      }
    }
  }
}
const discordBot = new Discord();
export default discordBot;
