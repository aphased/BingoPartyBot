import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["enable"],
  description: "Re-enable disabled commands",
  usage: "!p enable <command1> [command2]... | !p enable all",
  permission: Permissions.Admin,
  alwaysEnabled: true,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {Object} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
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
          `Invalid usage! Use: ${this.usage}`,
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
