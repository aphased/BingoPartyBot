import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["listdisabled", "disabled"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Lists disabled commands", // Description of the command
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
    let disabledCommands = [];
    let enabledCommands = [];
    bot.partyCommands.forEach((value, key) => {
      if (value.alwaysEnabled) return;
      if (value.disabled) disabledCommands.push(key[0]);
      else enabledCommands.push(key[0]);
    });

    if (disabledCommands.length < 1)
      return bot.reply(sender, "All commands are enabled!");
    if (enabledCommands.length < 1)
      return bot.reply(
        sender,
        "All commands are disabled (except ones that can't be disabled)",
      );
    // if there are more disabled commands than enabled ones, list only the enabled ones to avoid hitting the chat limit
    // this will probably only be a handful of commands in the majority of cases (e.g. "!p test" and "!p link" outside of bingo)
    if (disabledCommands.length > enabledCommands.length)
      bot.reply(
        sender,
        `All commands are currently disabled, except: ${enabledCommands.join(", ")}`,
      );
    else
      bot.reply(
        sender,
        `Currently disabled commands: ${disabledCommands.join(", ")}`,
      );
  },
};
