import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["help"],
  description: "Get info about available commands",
  usage: "!p help list | !p help <command>",
  permission: Permissions.HoB,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args[0] === "list") {
      bot.reply(
        sender,
        "Use '!p help <command>' for details and usage.",
        VerbosityLevel.Minimal,
      );
      let message = `Available commands: ${bot.partyCommands.map((value, key) => key[0]).join(", ")}`;
      // split message as many times as necessary if it's too long
      if (message.length > 252) {
        let i = 1;
        while (message.length) {
          let splitIndex =
            message.length <= 252
              ? message.length
              : message.slice(0, 252).lastIndexOf(" ");
          if (splitIndex === -1) splitIndex = 252;
          const toSend = message.slice(0, splitIndex);
          setTimeout(
            () => bot.reply(sender, toSend, VerbosityLevel.Minimal),
            i * bot.utils.minMsgDelay,
          );
          message = message.slice(splitIndex + 1);
          i++;
        }
      } else bot.reply(sender, message, VerbosityLevel.Minimal);
    } else {
      const command = bot.utils.getCommandByAlias(bot, args[0]);
      if (!command)
        return bot.reply(
          sender,
          `Use ${this.usage} or read the documentation on Github: aphased/BingoPartyCommands`,
          VerbosityLevel.Minimal,
        );
      const permission = Object.keys(Permissions).find((perm) => Permissions[perm] === command.permission)
      bot.reply(
        sender,
        `'${command.name[0]}': ${command.description}; Usage: ${command.usage}; Required Permission: ${permission ?? "none"} (level ${command.permission ?? "-1"}); Aliases: '${command.name.slice(1).join("', '")}'`,
        VerbosityLevel.Minimal,
      );
    }
  },
};
