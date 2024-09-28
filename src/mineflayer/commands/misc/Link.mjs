import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["link"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Link Command", // Description of the command
  permission: Permissions.Trusted,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!args[0])
      return bot.reply(
        sender.username,
        "Please provide a code to link your account",
      );
    let code = args[0];
    let status = bot.utils.link.getId(code);
    if (!status) return bot.reply(sender.username, "Invalid code");
    if (status.verified) return bot.reply(sender.username, "Code already used");
    bot.utils.link.setId(code, {
      verified: true,
      username: sender.username,
    });
    bot.reply(sender.username, "Account linked successfully");
  },
};
