import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["listdisabled", "disabled", "lsdisabled", "lsoff"],
  description: "List currently disabled commands",
  usage: "!p listdisabled",
  permission: Permissions.Admin,
  alwaysEnabled: true,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {Object} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let disabledCommands = [];
    let enabledCommands = [];
    bot.partyCommands.forEach((value, key) => {
      if (value.alwaysEnabled) return;
      if (value.disabled) disabledCommands.push(key[0]);
      else enabledCommands.push(key[0]);
    });

    if (disabledCommands.length < 1)
      return bot.reply(
        sender,
        "All commands are enabled!",
        VerbosityLevel.Minimal,
      );
    if (enabledCommands.length < 1)
      return bot.reply(
        sender,
        "All commands are disabled (except ones that can't be disabled)",
        VerbosityLevel.Minimal,
      );
    // if there are more disabled commands than enabled ones, list only the enabled ones to avoid hitting the chat limit
    // this will probably only be a handful of commands in the majority of cases (e.g. "!p test" and "!p link" outside of bingo)
    if (disabledCommands.length > enabledCommands.length)
      bot.reply(
        sender,
        `All commands are currently disabled, except: ${enabledCommands.join(", ")}`,
        VerbosityLevel.Minimal,
      );
    else
      bot.reply(
        sender,
        `Currently disabled commands: ${disabledCommands.join(", ")}`,
        VerbosityLevel.Minimal,
      );
  },
};
