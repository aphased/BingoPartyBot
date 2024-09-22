import { ApplicationCommandOptionType, Client } from "discord.js";

export default {
  name: "example",
  options: [
    {
      name: "example",
      description: "example",
      type: ApplicationCommandOptionType.String,
    },
  ],
  ignore: true,
  description: "example",
  /**
   *
   * @param {Client} bot
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async function (bot, interaction) {},
};
