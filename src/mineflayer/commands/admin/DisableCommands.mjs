import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["disable"],
  description: "Temporarily disable commands",
  usage: "!p disable <command1> [command2]... | !p disable all",
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
        value.disabled = true;
      });
      // TODO: also console log here
      bot.reply(sender, "All commands disabled!", VerbosityLevel.Reduced);
    } else if (args[0] && args[0].toLowerCase() === "most") {
      // TODO: make these a config or general database value or something –
      // and/or implement persistent disabled commands (remember values across
      // relaunches)
      const keepEnabled = ["cmd", "adduser", "test", "link", "help"];
      bot.partyCommands.forEach((value) => {
        if (value.alwaysEnabled) return;
        if (!keepEnabled.includes(value.name[0])) value.disabled = true;
      });
      bot.reply(
        sender,
        "All but a select few commands disabled!",
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
          "One or more commands can't be disabled!",
          VerbosityLevel.Reduced,
        );
      commands.forEach((cmd) => {
        cmd.disabled = true;
      });
      bot.reply(sender, "Command(s) disabled!", VerbosityLevel.Reduced);
    }
  },
};
