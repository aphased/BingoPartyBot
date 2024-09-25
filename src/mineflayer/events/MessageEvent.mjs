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
    if (bot.config.showMcChat && !message.self) {
      console.log(message.toAnsi())
      bot.utils.sendWebhookMessage(message.toAnsi(), bot.utils.classifyMessage(message.toString()))
    };
    if (message.self == true) {
      message = message.content
      bot.utils.sendWebhookMessage(message, bot.utils.classifyMessage(message.toString()))
    };
    if (RegExp(/^From /g).test(message.toString())) {
      let command = message.toString().split(": ").slice(1).join(": "); // !p promo (lets say)
      if (command.toLowerCase().startsWith("boop!"))
        return bot.chat(
          `/p invite ${Utils.removeRank(
            message.toString().split(": ")[0].replace("From ", ""),
          )}`,
        );
      if (command.toLowerCase().startsWith("help"))
        // TODO: execute "normal" help command here so logic isn't duplicated
        // and doesn't have to be kept in sync manually?

        // also TODO: we do not have the username here, yet! Either move some
        // lines of code around so we do have it, or ignore for the time being
        // since we /r anyways currently
        return bot.reply(
          "",
          "Read the documentation at GitHub: aphased/BingoPartyCommands",
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
        if (command.disabled) return;
        let sender = Utils.removeRank(
          message.toString().split(": ")[0].replace("From ", ""),
        );
        bot.utils.setUserRank({
          name: sender,
          rank: message
            .toString()
            .split(": ")[0]
            .replace("From ", "")
            .match(/\[.+]/g)[0],
        });
        sender = {
          username: sender,
          preferredName: bot.utils.getPreferredUsername({ name: sender }),
        };
        if (!command.permission)
          return command.execute(bot, sender, commandArgs);
        console.log(sender)
        if (
          command.permission <=
          bot.utils.getPermissionsByUser({ name: sender.username })
        )
          return command.execute(bot, sender, commandArgs);
        else bot.reply(
            sender.username,
            "You do not have permission to run this command!",
          );
          
      }
    }
  },
};
