import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["kick", "remove"],
  description: "Kick someone from the party",
  usage: "!p kick <username> [reason]",
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
        return bot.reply(sender, `Player ${player} not found.`, VerbosityLevel.Reduced);
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
      else {
        return bot.reply(
          sender,
          `You cannot kick a player of a higher permission level than yourself (your rank: ${senderPerms} (level: ${senderPermsRank}), their rank: ${playerPerms} (level: ${playerPermsRank})).`,
          VerbosityLevel.Reduced,
        );
      }
    }

    await bot.utils.delay(bot.utils.MinMsgDelay);
    bot.chat(`/lobby`);
    await bot.utils.delay(bot.utils.MinMsgDelay);
    bot.chat(`/p kick ${player}`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(
      `/pc ${player} was kicked from the party by ${sender.preferredName}.`,
    );
    
    bot.utils.webhookLogger.addMessage(
      `\`${player}\` was kicked from the party by \`${sender.preferredName}\`. Reason: \`${reason}\``,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
