import { Permissions } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["!guide", "!gd"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Public Guide Command", // Description of the command
  isPartyChatCommand: true,
  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.utils.getCommandByAlias(bot, "guide").execute(bot, sender, args, true);
  },
};
