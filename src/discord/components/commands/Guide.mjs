import { ApplicationCommandOptionType, Client } from "discord.js";
import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: "guide",
  options: [
    {
      name: "link",
      description: "link",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "date",
      description: "Date in MM/YYYY format",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  ignore: false,
  description: "Set the guide link for the month",
  permission: Permissions.Admin,
  /**
   *
   * @param {Client} bot
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async function (bot, interaction) {
    const link = interaction.options.getString("link");
    if (!/^(https:\/\/hypixel\.net\/threads\/bingo)/.test(link))
      return interaction.reply({
        content:
          "Invalid link! The link must be a hypixel.net link such as this: `https://hypixel.net/threads/bingo....`",
        ephemeral: true,
      });
    bot.utils.setMonthGuide({
      link: link,
      overwrite: true,
      time: interaction.options.getString("date"),
    });
    await interaction.reply({
      content: "Guide link has been set!",
      ephemeral: true,
    });
  },
};
