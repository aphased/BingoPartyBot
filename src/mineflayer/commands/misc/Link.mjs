import {
  DisableCommand,
  Permissions,
  VerbosityLevel,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["link"],
  description:
    "Link your Discord and Minecraft accounts. See tips in the online documentation for more info.",
  usage: "!p link <discord code>",
  permission: Permissions.Trusted,
  disableCommand: DisableCommand.UsuallyKeepEnabled,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!args[0])
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    let code = args[0];
    let status = bot.utils.link.getId(code);
    if (!status)
      return bot.reply(sender, "Invalid code", VerbosityLevel.Reduced);
    if (status.verified)
      return bot.reply(sender, "Code already used", VerbosityLevel.Reduced);
    bot.utils.link.setId(code, {
      verified: true,
      username: sender.username,
    });
    bot.reply(sender, "Account linked successfully", VerbosityLevel.Reduced);
  },
};
