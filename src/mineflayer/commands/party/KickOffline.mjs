import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["kickoffline", "kickafk", "ko", "ka"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Kick Offline Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // Code here
    bot.chat(`/pc ${sender.username} has all kicked offline players.`);
    setTimeout(() => {
      bot.chat("/p kickoffline");
      bot.webhook.send(
        {
          username: bot.config.webhook.name,
        },
        {
          content: `Kicked all offline players. Command executed by ${sender}`,
        },
      );
    }, 550);
  },
};
