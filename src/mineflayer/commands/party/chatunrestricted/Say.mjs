import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["say", "speak"],
  description: "Send a message in party chat",
  usage: "!p say <message>",
  permission: Permissions.Staff,
  // Command allows arbitrary chat output!

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (
    bot,
    sender,
    args,
    callerCommand = null,
    includePrefix = true,
  ) {
    if (args.length < 1) {
      bot.reply(
        sender,
        `Invalid command usage! Use: ${callerCommand ? callerCommand.usage : this.usage}`,
        VerbosityLevel.Reduced,
      );
      return;
    }
    bot.chat(
      `/pc ${sender?.preferredName && includePrefix ? `${sender.preferredName}: ` : ""}${args.join(" ")}`,
      VerbosityLevel.Minimal,
    );
  },
};
