import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["canceldisband", "cdisband", "disbandcancel"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Aborts a party disband during the 10 second delay", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!bot.utils.activeDisband)
      return bot.reply(sender, "There is no active party disband to cancel!");
    clearTimeout(bot.utils.activeDisband);
    bot.utils.activeDisband = null;
    bot.chat(`/pc Party disband was aborted by ${sender.preferredName}.`);
  },
};
