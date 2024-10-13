import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["disable"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Disables commands", // Description of the command
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
        value.disabled = true;
      });
      // TODO: also console log here
      bot.reply(sender, "All commands disabled!");
    } else {
      if (!args[0])
        return bot.reply(
          sender,
          "Please specify one or more command(s) to disable.",
        );
      let commands = [];
      args.forEach((arg) => {
        const found = bot.utils.getCommandByAlias(bot, arg);
        if (found) {
          commands.push(found);
        }
      });

      if (commands.length !== args.length)
        return bot.reply(sender, "One or more command(s) not found.");
      if (commands.some((cmd) => cmd.name.includes("disable") || cmd.name.includes("enable")))
        return bot.reply(
          sender,
          "'!p enable' and '!p disable' are always enabled!",
        );
      commands.forEach((cmd) => {
        cmd.disabled = true;
      });
      bot.reply(sender, "Command(s) disabled!");
    }
  },
};
