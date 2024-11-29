import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["canceldisband", "cdisband", "disbandcancel"],
  description: "Abort a party disband during the 10 second delay",
  usage: "!p canceldisband",
  permission: Permissions.Admin,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!bot.utils.activeDisband)
      return bot.reply(
        sender,
        "There is no active party disband to cancel!",
        VerbosityLevel.Reduced,
      );
    clearTimeout(bot.utils.activeDisband);
    bot.utils.activeDisband = null;
    bot.chat(`/pc Party disband was aborted by ${sender.preferredName}.`);
  },
};
