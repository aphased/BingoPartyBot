import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["enable"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Enables commands so they can be run using !p command", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command
  alwaysEnabled: true,
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
      bot.partyCommands.forEach((value) => {
        if (value.alwaysEnabled) return;
        value.disabled = false;
      });
      // TODO: also console log here
      bot.reply(
        sender,
        "All commands have been enabled!",
        VerbosityLevel.Reduced,
      );
    } else {
      if (!args[0])
        return bot.reply(
          sender,
          "Please specify one or more command(s) to enable.",
          VerbosityLevel.Reduced,
        );
      let commands = [];
      args.forEach((arg) => {
        const found = bot.utils.getCommandByAlias(bot, arg);
        if (found) {
          commands.push(found);
        }
      });

      if (commands.length !== args.length)
        return bot.reply(
          sender,
          "One or more command(s) not found.",
          VerbosityLevel.Reduced,
        );
      if (commands.some((cmd) => cmd.alwaysEnabled))
        return bot.reply(
          sender,
          "One or more commands are always enabled!",
          VerbosityLevel.Reduced,
        );
      commands.forEach((cmd) => {
        cmd.disabled = false;
      });
      bot.reply(sender, "Command(s) enabled!", VerbosityLevel.Reduced);
    }
  },
};
