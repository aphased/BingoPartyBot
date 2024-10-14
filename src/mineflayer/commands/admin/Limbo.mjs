import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["limbo", "sendLimbo"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Sends the bot to Limbo", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.chat("/lobby");
    await bot.utils.waitForDelay(bot.utils.minMsgDelay);
    bot.chat("/limbo");
    await bot.utils.waitForDelay(bot.utils.minMsgDelay);
    bot.reply(sender, `Limboed!`);
  },
};
