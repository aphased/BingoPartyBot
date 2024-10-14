import Utils from "../../utils/Utils.mjs";
import { SenderType, Permissions } from "../../utils/Interfaces.mjs";

export default {
  name: "MessageEvent",
  description: "The message event stuff",
  /**
   *
   * @param {String} message
   * @param {import("../Bot.mjs").default} bot
   */
  execute: async function (message, bot) {
    if (message.toString() === bot.utils.chatSeparator) return;
    // Attempt to extract locraw's "server" entry from message and check for limbo
    const locrawServer = message
      .toString()
      .match(/^{"server":"(\w+)"(,"\w+":"[\w ]+")*}$/)?.[1];
    if (locrawServer) {
      if (locrawServer !== "limbo" && !bot.config.debug.disableAutoLimbo) {
        bot.chat("/limbo");
      }
      return;
    }
    let msgType = SenderType.Minecraft;
    let discordReplyId;
    if (bot.config.showMcChat && !message.self) {
      console.log(message.toAnsi());
      bot.utils.webhookLogger.addMessage(
        message.toAnsi(undefined, bot.utils.discordAnsiCodes),
        bot.utils.classifyMessage(message.toString()),
      );
    }
    const partyInvite = bot.utils.findValidPartyInvite(message);
    if (
      partyInvite &&
      !bot.utils.getCommandByAlias(bot, "invite").disabled
    ) {
      setTimeout(() => {
        bot.chat(`/p accept ${partyInvite}`);
      }, bot.utils.minMsgDelay);
    }
    if (message.self == true) {
      msgType = SenderType.Console;
      if (message.discord) {
        msgType = SenderType.Discord;
        discordReplyId = message.discordReplyId;
      }
      message = message.content;
      bot.utils.webhookLogger.addMessage(
        message,
        bot.utils.classifyMessage(message.toString()),
      );
    }
    if (RegExp(/^From /g).test(message.toString())) {
      let command = message.toString().split(": ").slice(1).join(": "); // !p promo (lets say)
      if (command.toLowerCase().startsWith("boop!") && !bot.utils.getCommandByAlias(bot, "invite").disabled)
        // TODO: this needs a settings toggle – if !p invite is disabled, this
        // shouldn't work either
        return bot.chat(
          `/p invite ${Utils.getUsername(message.toString())}`,
        );
      if (command.toLowerCase().includes("help"))
        // TODO: execute "normal" help command here so logic isn't duplicated
        // and doesn't have to be kept in sync manually?

        // also TODO: we do not have the username here, yet! Either move some
        // lines of code around so we do have it, or ignore for the time being
        // since we /r anyways currently
        return bot.reply(
          "",
          "Read the documentation on GitHub: aphased/BingoPartyCommands",
        );

      let args = command.split(" "); // Get the arugments of the command
      let commandFound;
      if (args.length < 2) return;
      if (
        args[0].toLowerCase() !== bot.config.partyCommandPrefix.toLowerCase()
      ) {
        commandFound = bot.partyCommands.find(
          (value, key) =>
            key.includes(args[1].toLowerCase()) &&
            value.customPrefix &&
            value.customPrefix.toLowerCase() === args[0].toLowerCase(),
        );
      } else {
        commandFound = bot.partyCommands.find(
          (value, key) =>
            key.includes(args[1].toLowerCase()) && !value.customPrefix,
        );
      }
      let commandName = args[1]; // Get the command name
      let commandArgs = args.slice(2); // Get the command arguments
      if (commandFound) {
        let command = commandFound;
        if (command.disabled)
          return bot.chat(`/r This command is currently disabled!`);
        //okay i know its not really neccesary but like make the bot more responsive i guess
        //i didnt use bot.reply because it crashes using sender.username which is probalby due to it being right below me vvvvvvvvvvvvvvv
        let sender = Utils.getUsername(message.toString());
        // Extract Hypixel rank from the message
        const match = message
          .toString()
          .split(": ")[0]
          .replace("From ", "")
          .match(/\[.+]/g);

        // Check if match is null or empty (=non-ranked), and assign accordingly
        const rank = match && match.length > 0 ? match[0] : "";

        // Set the user rank
        bot.utils.setUserRank({
          name: sender,
          rank: rank,
        });
        sender = {
          username: sender,
          preferredName: bot.utils.getPreferredUsername({ name: sender }),
          commandName: commandName,
          type: msgType,
          discordReplyId: discordReplyId,
        };
        if (!command.permission)
          return command.execute(bot, sender, commandArgs);

        let userPermissionLevel = bot.utils.getPermissionsByUser({
          name: sender.username,
        });
        if (command.permission <= userPermissionLevel)
          return command.execute(bot, sender, commandArgs);
        else {
          // Compare against the lowest permission rank which effectively is not
          // allowed to (and can't) do anything
          if (userPermissionLevel > Permissions.ExSplasher)
            // Don't reply if the sender may not even be on the allowlist at
            // all, could be just anybody/a random player too
            bot.reply(
              sender,
              "You do not have permission to run this command!",
            );
        }
      }
    } else if (RegExp(/^Party > /g).test(message.toString())) {
      let command = message.toString().split(": ").slice(1).join(": ");
      let args = command.split(" ");
      // Check if the message is blacklisted and kick if so
      let kickList = await bot.utils.getKickList();
      if (kickList.some((e) => args[0].startsWith(e))) {
        return bot.chat(
          `/p kick ${Utils.getUsername(message.toString())}`,
        );
      }
      let commandFound = bot.partyCommands.find(
        (value, key) =>
          key.includes(args[0].toLowerCase()) && value.isPartyChatCommand,
      );
      if (commandFound) {
        command = commandFound;
        if (command.disabled) return;
        let sender = Utils.getUsername(message.toString());
        // No need to check and update rank in allowlist for public party commands
        sender = {
          username: sender,
          preferredName: bot.utils.getPreferredUsername({ name: sender }),
          commandName: args[0],
          type: msgType,
          discordReplyId: discordReplyId,
        };
        if (!command.permission)
          return command.execute(bot, sender, args.slice(1));
        let userPermissionLevel = bot.utils.getPermissionsByUser({
          name: sender.username,
        });
        if (command.permission <= userPermissionLevel)
          return command.execute(bot, sender, args.slice(1));
      }
    }
  },
};
