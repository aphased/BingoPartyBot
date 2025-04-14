import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["say", "speak"],
  description:
    "Send any message in party chat through the bot. Restricted due to allowing arbitrary messages.",
  usage: "!p say <message>",
  permission: Permissions.Staff,
  // Command allows arbitrary chat output!

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args, callerCommand = null) {
    if (args.length < 1) {
      bot.reply(
        sender,
        `Invalid command usage! Use: ${callerCommand ? callerCommand.usage : this.usage}`,
        VerbosityLevel.Reduced,
      );
      return;
    }
    bot.chat(
      `/pc ${sender?.preferredName ? `${sender.preferredName}: ` : ""}${args.join(" ")}`,
      VerbosityLevel.Minimal,
    );
  },
};
