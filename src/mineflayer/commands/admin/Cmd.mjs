import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["cmd", "execute", "exec"],
  description: "Execute any command as the bot",
  usage: "!p cmd <command>",
  permission: Permissions.Owner,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.chat("/" + args.join(" "));
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.reply(
      sender,
      `Executed command: /${args.join(" ")}`,
      VerbosityLevel.Reduced,
    );
  },
};
