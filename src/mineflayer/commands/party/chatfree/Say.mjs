import { Permissions } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["say", "speak"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Say Command", // Description of the command
  permission: Permissions.Staff, // Permission level required to execute
  // Command allows arbitrary chat output!
  
  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args.length < 1) {
      bot.reply(sender, "Please provide a message to send.");
      return;
    }
    bot.chat(`/pc ${sender.preferredName}: ${args.join(" ")}`);
  },
};
