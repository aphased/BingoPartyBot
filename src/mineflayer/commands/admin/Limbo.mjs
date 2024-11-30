import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["limbo", "sendLimbo"],
  description: "Manually send the bot to Limbo",
  usage: "!p limbo",
  permission: Permissions.Staff,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.chat("/lobby");
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat("/limbo");
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.reply(sender, `Limboed!`, VerbosityLevel.Reduced);
  },
};
