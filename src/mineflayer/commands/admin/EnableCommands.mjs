import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["enable"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Test command", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {Object} sender
   * @param {String} [sender.username] - Username of the sender
   * @param {String} [sender.preferredName] - Preferred name of the sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // Code here
    if (args[0] && args[0].toLowerCase() === "all") {
      bot.partyCommands.forEach((value, key) => {
        if (key.includes("disable") || key.includes("enable")) return;
        bot.partyCommands.get(key).disabled = false;
      });
      // TODO: also console log here
      bot.reply(sender, "All commands enabled");
    } else {
      if (!args[0])
        return bot.reply(sender, "Please specify a command to enable");
      // TODO: this should work for just one, but also _multiple_ commands
      // sent at once (whitespace-separated)
      let command = bot.partyCommands.find((value, key) =>
        key.includes(args[0]),
      );
      if (!command) return bot.reply(sender, "Command not found");
      command.disabled = false;
      bot.reply(sender, "Command enabled");
    }
  },
};
