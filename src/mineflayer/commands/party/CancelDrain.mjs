import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["canceldrain", "cdrain", "draincancel"],
  description: "Abort a party drain within the 10 second grace period.",
  usage: "!p canceldrain",
  permission: Permissions.Admin,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!bot.utils.activeDrain)
      return bot.reply(
        sender,
        "There is no active party drain to cancel!",
        VerbosityLevel.Reduced,
      );
    clearTimeout(bot.utils.activeDrain);
    bot.utils.activeDrain = null;
    bot.chat(`/pc Party drain was aborted by ${sender.preferredName}.`);
  },
};
