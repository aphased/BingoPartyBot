import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["unban", "unblock"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Unban Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player = args[0];
    if (!player)
      return bot.reply(sender, "Please provide a player to unban.");
    bot.reply(sender, `Trying to unban ${player}...`);
    setTimeout(() => {
      bot.chat(`/lobby`);
      setTimeout(() => {
        bot.chat(`/block remove ${player}`);
        setTimeout(() => {
          bot.reply(sender, `Unbanned ${player}.`);
          bot.webhook.send(
            {
              username: bot.config.webhook.name,
            },
            {
              content: `\`${player}\` was unbanned from the party by \`${sender.preferredName}\`.`,
            },
          );
        }, bot.utils.minMsgDelay);
      }, bot.utils.minMsgDelay);
    }, bot.utils.minMsgDelay);
  },
};
