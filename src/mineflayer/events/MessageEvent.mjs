import Utils from "../../utils/Utils.mjs";
import { SenderType, VerbosityLevel } from "../../utils/Interfaces.mjs";

export default {
  name: "MessageEvent",
  description: "The message event stuff",
  /**
   *
   * @param {String} message
   * @param {import("../Bot.mjs").default} bot
   */
  execute: async function (message, bot) {
    const messageText = message.toString();
    if (messageText === bot.utils.chatSeparator) return;
    // Attempt to extract locraw's "server" entry from message and check for limbo
    const locrawServer = messageText.match(/^{"server":"(\w+)"(,"\w+":"[\w ]+")*}$/)?.[1];
    if (locrawServer) {
      if (locrawServer !== "limbo" && !bot.config.debug.disableAutoLimbo) {
        bot.chat("/limbo");
      }
      return;
    }
    let msgType = SenderType.Minecraft;
    let discordReplyId;
    if (message.self === true) {
      msgType = SenderType.Console;
      if (message.isDiscord) {
        msgType = SenderType.Discord;
        discordReplyId = message.discordReplyId;
      }
    }
    if (bot.config.showMcChat) {
      const source =
        msgType === SenderType.Discord
          ? "discord"
          : msgType === SenderType.Console
            ? "operator"
            : "minecraft";
      bot.utils.emitRuntimeEvent({
        source,
        kind: "chat",
        level: "info",
        text: messageText,
        ansiText: message.toAnsi?.(),
        metadata: {
          direction: msgType === SenderType.Minecraft ? "inbound" : "outbound",
          discordReplyId,
        },
      });
      bot.utils.webhookLogger.addMessage(
        message.toAnsi(undefined, bot.utils.discordAnsiCodes),
        bot.utils.classifyMessage(messageText),
      );
    }
    const partyInvite = bot.utils.findValidPartyInvite(message);
    if (partyInvite && !bot.utils.getCommandByAlias(bot, "invite").disabled) {
      await bot.utils.delay(bot.utils.minMsgDelay);
      bot.chat(`/p accept ${partyInvite}`);
    }
    const command = messageText.split(": ").slice(1).join(": ");
    const args = command.split(" ");
    let commandFound;
    if (RegExp(/^From /g).test(messageText)) {
      if (
        command.toLowerCase().startsWith("boop!") &&
        !bot.utils.getCommandByAlias(bot, "invite").disabled
      )
        return bot.chat(`/p invite ${Utils.extractUsername(messageText)}`);

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
    } else if (RegExp(/^Party > /g).test(messageText)) {
      // Check if the message is blacklisted and kick if so
      let kickList = await bot.utils.getKickList();
      if (kickList.some((e) => args[0].startsWith(e))) {
        return bot.chat(`/p kick ${Utils.extractUsername(messageText)}`);
      }
      commandFound = bot.partyCommands.find(
        (value, key) =>
          key.includes(args[0].toLowerCase()) && value.isPartyChatCommand,
      );
    }
    if (commandFound) {
      const command = commandFound;
      const commandName = args[1];
      const commandArgs = args.slice(2);
      let sender = Utils.extractUsername(messageText);
      if (msgType === SenderType.Minecraft) {
        // Get Hypixel rank from the message
        const rank = Utils.extractHypixelRank(messageText);
        // Update the sender account's hypixel rank if necessary (will fail safely if user is not in db)
        if (bot.utils.getHypixelRank({ name: sender }) !== rank)
          bot.utils.setHypixelRank({
            name: sender,
            hypixelRank: rank,
          });
      }
      sender = {
        username: sender,
        preferredName: bot.utils.getPreferredUsername({ name: sender }),
        commandName: commandName,
        type: msgType,
        discordReplyId: discordReplyId,
      };
      if (
        isNaN(command.permission) ||
        command.permission <=
          bot.utils.getPermissionsByUser({ name: sender.username })
      ) {
        if (command.disabled)
          return bot.reply(
            sender,
            "This command is currently disabled!",
            VerbosityLevel.Minimal,
          );
        command.execute(bot, sender, commandArgs);
      } else if (bot.utils.getUserObject({ name: sender.username }))
        // don't reply if user is not in the db
        return bot.reply(
          sender,
          "You don't have permission to execute this command!",
          VerbosityLevel.Minimal,
        );
    }
  },
};
