import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["canceldrain", "cdrain", "draincancel"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Aborts a party drain during the 10 second delay", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!bot.utils.activeDrain)
      return bot.reply(sender, "There is no active party drain to cancel!");
    clearTimeout(bot.utils.activeDrain);
    bot.utils.activeDrain = null;
    bot.chat(`/pc Party drain was aborted by ${sender.preferredName}.`);
  },
};
