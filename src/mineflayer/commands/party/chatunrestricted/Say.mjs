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
   * @param {import("../../EXAMPLECOMMAND.mjs").default} internalOptions.callerCommand
   * @param {Boolean} internalOptions.includePrefix
   */
  execute: async function (
    bot,
    sender,
    args,
    internalOptions = { callerCommand: this, includePrefix: true },
  ) {
    if (args.length < 1) {
      bot.reply(
        sender,
        `Invalid command usage! Use: ${internalOptions?.callerCommand?.usage}`,
        VerbosityLevel.Reduced,
      );
      return;
    }
    bot.chat(
      `/pc ${sender?.preferredName && internalOptions.includePrefix ? `${sender.preferredName}: ` : ""}${args.join(" ")}`,
      VerbosityLevel.Minimal,
    );
  },
};
