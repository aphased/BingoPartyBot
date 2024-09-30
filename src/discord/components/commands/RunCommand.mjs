import { ApplicationCommandOptionType, Client, Message } from "discord.js";
import { utils } from "../../../utils/Utils.mjs";
import myBot from "../../../mineflayer/Bot.mjs";

export default {
  name: "run",
  options: [
    {
      name: "command",
      description: "The command to run (i.e: !p adduser CoolGuy)",
      type: ApplicationCommandOptionType.String,
    },
  ],
  ignore: false,
  description: "example",
  /**
   *
   * @param {import("../../Discord.mjs").default} bot
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async function (bot, interaction) {
    const command = interaction.options.getString("command");
    /** @type {Message} */
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    let replyId = utils.generateRandomString(10);
    if (!command) return interaction.editReply("You need to provide a command to run!");
    bot.utils.discordReply.setReply(replyId, interaction);
    let user = bot.utils.getUserObject({ discord: interaction.user.id });
    if(!user) return interaction.editReply("You need to link your account first!");
    myBot.onMessage({
      content: `From ${user.hypixelRank} ${user.accounts[0].name}: ${command}`,
      self: true,
      discord: true,
      discordReplyId: replyId,
    })
  },
};
