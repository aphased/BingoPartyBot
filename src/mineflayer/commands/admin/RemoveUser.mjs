import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["removeuser"],
  description:
    "Remove a user or a single account from the permission database.",
  usage: "!p removeuser <username> [only]",
  permission: Permissions.Staff,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let user = args[0];
    let only = args[1]?.toLowerCase() === "only";
    if (!user)
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    if (!bot.utils.getUserObject({ name: user }))
      return bot.reply(
        sender,
        `User ${user} not found in database!`,
        VerbosityLevel.Reduced,
      );
    if (!bot.utils.isHigherRanked(sender.username, user))
      return bot.reply(
        sender,
        `Your permission rank is too low to perform this operation.`,
        VerbosityLevel.Reduced,
      );
    bot.utils.removeUser({ name: user, onlyThis: only });
    if (only) {
      bot.utils.webhookLogger.addMessage(
        `\`${user}\` was removed from the database (without impacting their other accounts) by \`${sender.username}\`.`,
        WebhookMessageType.ActionLog,
        true,
      );
      return bot.reply(
        sender,
        `Removed account ${user}, but kept other alts.`,
        VerbosityLevel.Reduced,
      );
    }
    bot.utils.webhookLogger.addMessage(
      `\`${user}\` and all their other accounts were removed from the database by \`${sender.username}\`.`,
      WebhookMessageType.ActionLog,
      true,
    );
    bot.reply(
      sender,
      `Removed user ${user} and all their other accounts.`,
      VerbosityLevel.Reduced,
    );
  },
};
