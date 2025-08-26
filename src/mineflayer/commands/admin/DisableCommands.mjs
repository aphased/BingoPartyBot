import {
  DisableCommand,
  Permissions,
  VerbosityLevel,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["disable"],
  description:
    "Disable bot commands from being used. Note that certain commands can't be disabled.",
  usage: "!p disable <command1> [command2]... | !p disable <all|most>",
  permission: Permissions.Admin,
  disableCommand: DisableCommand.ForceEnabled,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {Object} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args[0]?.toLowerCase() === "all") {
      let commands = [];
      bot.partyCommands.forEach((value) => {
        if (value.disableCommand >= DisableCommand.ForceEnabled) return;
        commands.push(value.name[0]);
        value.disabled = true;
      });
      if (bot.config.persistentDisabledCommands)
        bot.utils.updateStoredCommandStates(true, commands);
      // TODO: also console log here
      bot.reply(sender, "All commands disabled!", VerbosityLevel.Reduced);
    } else if (args[0]?.toLowerCase() === "most") {
      let commands = [];
      bot.partyCommands.forEach((value) => {
        if (value.disableCommand > DisableCommand.Normal) return;
        commands.push(value.name[0]);
        value.disabled = true;
      });
      if (bot.config.persistentDisabledCommands)
        bot.utils.updateStoredCommandStates(true, commands);
      bot.reply(sender, "Most commands disabled!", VerbosityLevel.Reduced);
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
      if (
        commands.some(
          (cmd) => cmd.disableCommand >= DisableCommand.ForceEnabled,
        )
      )
        return bot.reply(
          sender,
          "One or more commands can't be disabled!",
          VerbosityLevel.Reduced,
        );
      commands.forEach((cmd) => {
        cmd.disabled = true;
      });
      if (bot.config.persistentDisabledCommands)
        bot.utils.updateStoredCommandStates(
          true,
          commands.map((cmd) => cmd.name[0]),
        );
      bot.reply(sender, "Command(s) disabled!", VerbosityLevel.Reduced);
    }
  },
};
