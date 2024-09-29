import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["close", "private"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description:
    "Closes the party", // Description of the command
  permission: Permissions.Staff, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let reason = args.slice(0).join(" ") || "No reason given.";
    bot.chat(`/pc Party was closed by ${sender.username}.`);
    setTimeout(() => {
      bot.chat(`/stream close`);
      bot.webhook.send(
        {
          username: bot.config.webhook.name,
        },
        {
          content: `Party was closed by \`${sender.username}\`. Reason: \`${reason}\``,
        },
      );
    }, bot.utils.minMsgDelay);
  },
};
