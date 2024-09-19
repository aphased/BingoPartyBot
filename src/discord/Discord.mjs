/*
 *
 *
 * The much needed Discord bot rewrite has now arrived!!
 *
 *
 */
import { Client, GatewayIntentBits } from "discord.js";
import Config from "../../Config.mjs";
class Discord {
  constructor() {
    this.config = Config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.client.login(this.config.discordBotInfo.token);
    this.client.once("ready", this.clientReady)
  }
  clientReady(bot) {
    console.log(`Discord bot ready! Logged in as ${bot.user.tag}`);
  }
}
const discordBot = new Discord();
export default discordBot;