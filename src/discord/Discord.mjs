import fs from "fs/promises";
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
          10000,
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
    if (this.config.enableDiscordDocsUpdate)
      this.updateDocChannel(
        this.config.discordBotInfo.commandDocsChannel,
        this.config.discordBotInfo.discordDocsPathRelative,
      );
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
    if (channel && !channel.isTextBased()) return;
    const messages = await channel.messages.fetch({
      limit: 1,
    });
    let message = messages.first();
    let messageTimeStamp = new Date(message.createdTimestamp);
    let currentTimeStamp = new Date();
    if (messageTimeStamp.getMonth() !== currentTimeStamp.getMonth() - 1) return;
    const match = message.content.match(
      /https:\/\/hypixel\.net\/threads\/bingo\S+/,
    );
    if (match) {
      let guide = this.utils.getMonthGuide();
      if (!guide) {
        let humanReadableMonth = messageTimeStamp.getMonth() + 2;
        this.utils.setMonthGuide({
          link: match[0],
          time: humanReadableMonth + "/" + messageTimeStamp.getFullYear(),
        });
      }
    }
  }

  async updateDocChannel(channelId, newDocsPath) {
    if (!channelId) return 1;
    const channel = await this.bot.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) return 1;
    if (!newDocsPath) return 2;
    let newDocs;
    try {
      newDocs = (await fs.readFile(newDocsPath, "utf-8")).trim();
    } catch (err) {
      console.warn(
        "Unable to load discord documentation file from specified path.",
      );
      console.log(err);
      return 3;
    }
    let messages = await channel.messages.fetch({ limit: 10 });
    // warn about high number of messages
    if (messages.size === 10) {
      console.warn(
        "Discord documentation channel contains >=10 messages, make sure it is the correct channel!",
      );
      return 4;
    }
    messages = messages.filter((msg) => msg.author.id === this.bot.user.id);
    const currentMessagesContent = messages
      .map((msg) => msg.content)
      .reverse()
      .join("\n");
    // no update needed
    if (currentMessagesContent === newDocs) {
      console.log("Discord documentation is already up-to-date.");
      return -1;
    }
    await channel.bulkDelete(messages);
    // split into multiple messages if necessary, preferrably splitting at new line
    const messageChunks = this.utils.splitMessage(newDocs, 2000, "\n");
    for (const chunk of messageChunks) await channel.send(chunk);
    console.log("Successfully updated discord documentation.");
    return 0;
  }
}
const discordBot = new Discord();
export default discordBot;
