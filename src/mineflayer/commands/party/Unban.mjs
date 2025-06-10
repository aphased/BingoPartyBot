import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["unban", "unblock"],
  description: "Unban a player from the party",
  usage: "!p unban <username> [reason]",
  permission: Permissions.Trusted,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player = args[0];
    if (!player) {
      return bot.reply(sender, `Invalid usage! Use: ${this.usage}`, VerbosityLevel.Reduced);
    }
    const playerExists = await bot.utils.usernameExists(player);
    if (playerExists === false) {
      return bot.reply(sender, `Player ${player} not found`, VerbosityLevel.Reduced);
    }
    const reason = args.slice(1).join(" ") || "No reason given.";

    if (!bot.utils.isHigherRanked(sender.username, player)) {
      const senderPermsRank = bot.utils.getPermissionsByUser({ name: sender.username });
      const playerPermsRank = bot.utils.getPermissionsByUser({ name: player });
      const senderPerms = Object.keys(Permissions).find(
        (perm) => Permissions[perm] === senderPermsRank,
      );
      const playerPerms = Object.keys(Permissions).find(
        (perm) => Permissions[perm] === playerPermsRank,
      );
      if (senderPerms === undefined) return;
      else if (senderPermsRank === playerPermsRank) {
        return bot.reply(
          sender,
          `You cannot unban a player of the same permission level (both: ${senderPerms}).`,
          VerbosityLevel.Reduced,
        );
      } else {
        return bot.reply(
          sender,
          `You cannot unban a player of a higher permission level than yourself (your rank: ${senderPerms} (level: ${senderPermsRank}), their rank: ${playerPerms} (level: ${playerPermsRank})).`,
          VerbosityLevel.Reduced,
        );
      }
    }

    bot.reply(sender, `Trying to unban ${player}...`, VerbosityLevel.Reduced);
    
    if (!registry.isBanned(username)) {
      return bot.reply(sender, `${username} is not currently banned.`, VerbosityLevel.Reduced);
    } else {
      const remaining = getRemainingDuration(registry, player);
      if (remaining && remaining !== "ban has expired") {
        registry.removeBan(username);
        return bot.reply(sender, `${username}'s ban has been reduced from ${remaining} to unbanned.`, VerbosityLevel.Reduced);
      }
    }
    
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/lobby`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/block remove ${player}`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.reply(sender, `Unbanned ${player}.`, VerbosityLevel.Reduced);
    
    bot.utils.webhookLogger.addMessage(
      `\`${player}\` was unbanned from the party by \`${sender.preferredName}\`. Reason: \`${reason}\``,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
