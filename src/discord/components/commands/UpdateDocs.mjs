import { ApplicationCommandOptionType, Client } from "discord.js";
import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: "updatedocs",
  options: [],
  ignore: false,
  description: "Update the messages in the documentation channels",
  permission: Permissions.Admin,
  /**
   *
   * @param {Client} bot
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async function (bot, interaction) {
    if (bot.config.discordBotInfo.commandDocumentationChannels.length < 1)
      return await interaction.reply({
        content: "There are no configured documentation channels to update.",
        ephemeral: true,
      });
    let returnCodes = [];
    for (const channelID of bot.config.discordBotInfo
      .commandDocumentationChannels) {
      returnCodes.push(
        await bot.updateDocChannel(
          channelID,
          bot.config.discordBotInfo.discordDocsPathRelative,
        ),
      );
    }
    let messages = ["Status messages:"];
    for (let i = 0; i < returnCodes.length; i++) {
      let message;
      switch (returnCodes[i]) {
        case 0:
          message = "Documentation has been updated successfully.";
          break;
        case -1:
          message = "Documentation is already up-to-date.";
          break;
        case 1:
          message = "Channel ID is invalid.";
          break;
        case 2:
          message = "Documentation file path is not configured.";
          break;
        case 3:
          message = "Failed to load documentation file from configured path.";
          break;
        case 4:
          message =
            "Channel contains >=10 messages, make sure it is the correct one!";
          break;
      }
      messages.push(
        `\`${bot.config.discordBotInfo.commandDocumentationChannels[i]}\`: ${message}`,
      );
    }
    await interaction.reply({
      content: messages.join("\n"),
      ephemeral: true,
    });
  },
};
