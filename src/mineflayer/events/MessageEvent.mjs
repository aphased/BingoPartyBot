import { Collection } from "discord.js";
import Utils from "../../utils/Utils.mjs";

export default {
  name: "MessageEvent",
  description: "The message event stuff",
  /**
   *
   * @param {String} message
   * @param {import("../Bot.mjs").default} bot
   */
  execute: async function (message, bot) {
    if (bot.config.showMcChat && !message.self) console.log(message.toAnsi());
    if (message.self == true) message = message.content;
    if (RegExp(/^From /g).test(message.toString())) {
      let command = message.toString().split(": ").slice(1).join(": "); // !p promo (lets say)
      if (command.toLowerCase().startsWith("boop!"))
        return bot.bot.chat(
          `/p invite ${Utils.removeRank(message.toString().split(": ")[0].replace("From ", ""))}`,
        );
      let args = command.split(" "); // Get the arugments of the command
      if (args[0].toLowerCase() !== bot.config.partyCommandPrefix.toLowerCase())
        return;
      let commandName = args[1]; // Get the command name
      let commandArgs = args.slice(2); // Get the command arguments
      if (bot.partyCommands.find((value, key) => key.includes(commandName))) {
        let command = bot.partyCommands.find((value, key) =>
          key.includes(commandName),
        );
        let sender = Utils.removeRank(
          message.toString().split(": ")[0].replace("From ", ""),
        );
        if (!command.permission)
          return command.execute(bot, sender, commandArgs);
        if (
          command.permission <= bot.utils.getPermissionsByUser({ name: sender })
        )
          return command.execute(bot, sender, commandArgs);
        else
          bot.reply(sender, "You do not have permission to run this command!");
      }
    }
  },
};
