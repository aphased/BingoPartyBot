import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["disband"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Disband Command", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
      let reason = args.slice(0).join(" ") || "No reason given.";
    bot.chat(
      `/pc The party was disbanded by ${sender.username}. 10 seconds remaining until disband!`,
    );
    await bot.utils.waitForDelay(10000);
      bot.chat("/p disband");
      bot.webhook.send(
        {
          username: bot.config.webhook.name,
        },
        {
          content: `The party was disbanded by \`${sender.username}\`. Reason: \`${reason}\``,
        },
      );
  },
};
