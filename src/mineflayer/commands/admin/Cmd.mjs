import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["exec", "execute", "cmd"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description:
    "Admin-only, full execution of arguments as a chat command on the bot account (minus leading slash)", // Description of the command
  permission: Permissions.Owner, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.chat("/" + args.join(" "));
    setTimeout(() => {
      bot.reply(sender.username, bot.minMsgDelay + `Executed command: ${args.join(" ")}`);
    }, bot.utils.minMsgDelay);
  },
};
