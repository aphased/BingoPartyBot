import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["removeuser"],
  ignore: false,
  description: "Removes a user from the permission list",
  permission: Permissions.Staff,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let user = args[0];
    let only = args[1]?.toLowerCase?.() === "only";
    if (!user)
      return bot.reply(
        sender,
        'Please supply a username to remove! You can choose to keep the person\'s other accounts by appending "only".',
      );
    if (!bot.utils.getUserObject({ name: user }))
      return bot.reply(sender, `User ${user} not found in database!`);
    if (!bot.utils.isHigherRanked(sender.username, user))
      return bot.reply(
        sender,
        `Your permission rank is too low to perform this operation.`,
      );
    bot.utils.removeUser({ name: user, onlyThis: only });
    if (only)
      return bot.reply(sender, `Removed account ${user}, but kept other alts.`);
    bot.reply(sender, `Removed user ${user} and all their other accounts.`);
  },
};
