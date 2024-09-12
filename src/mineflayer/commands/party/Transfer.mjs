import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["transfer"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Transfer Command", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if(!args[0]) return bot.bot.chat(`/w ${sender} Please provide a username to transfer the party to.`);
    bot.bot.chat("/pc This party will be transferred to " + args[0]);
    setTimeout(() => {
      bot.bot.chat(`/p transfer ${args[0]}`);
      bot.webhook.send(
        {
          username: bot.config.webhook.name,
        },
        {
          content: `Transferred party to ${args[0]}. Command executed by ${sender}`,
        }
      );
    }, 1000);
  },
};
