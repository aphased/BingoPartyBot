import { ApplicationCommandOptionType, Client } from "discord.js";
import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: "updatedocs",
  options: [],
  ignore: false,
  description: "Update the messages in the documentation channel",
  permission: Permissions.Admin,
  /**
   *
   * @param {Client} bot
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async function (bot, interaction) {
    const returnCode = await bot.updateDocChannel(
      bot.config.discordBotInfo.commandDocsChannel,
      bot.config.discordBotInfo.discordDocsPathRelative,
    );
    let message;
    switch (returnCode) {
      case 0:
        message = "Documentation has been updated successfully.";
        break;
      case -1:
        message = "Documentation is already up-to-date.";
        break;
      case 1:
        message = "Documentation channel is not configured or not found.";
        break;
      case 2:
        message = "Documentation file path is not configured.";
        break;
      case 3:
        message = "Failed to load documentation file from configured path.";
        break;
      case 4:
        message =
          "Configured documentation channel contains >=10 messages, make sure it is the correct one!";
        break;
    }
    await interaction.reply({
      content: message,
      ephemeral: true,
    });
  },
};
