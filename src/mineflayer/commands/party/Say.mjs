import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["say", "speak"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Say Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args.length < 1) {
      bot.reply(sender, "Please provide a message to send.");
      return;
    }
    // TODO: generalize this to all other commands with "custom" output
    // message(s) – or just move this check into `bot.chat()` which all chat
    // uses _should_ be using
    if (args.join(" ").split("").length > 256) {
      bot.reply(
        sender,
        "Message is too long! Please keep it under 256 characters.",
      );
      return;
    }
    bot.chat(`/pc ${sender.username}: ${args.join(" ")}`);
  },
};
