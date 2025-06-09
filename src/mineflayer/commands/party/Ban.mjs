import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["ban", "block"],
  description: "Ban a player from joining the party",
  usage: "!p ban <username> [reason]",
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
      return bot.reply(
        sender,
        `You cannot ban a player of a higher permission level than yourself (your rank: ${senderPerms} (level: ${senderPermsRank}), their rank: ${playerPerms} (level: ${playerPermsRank}).`,
        VerbosityLevel.Reduced,
      );
    }
    
    bot.reply(sender, `Trying to ban ${player}...`, VerbosityLevel.Reduced);
    
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/lobby`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/block add ${player}`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/p kick ${player}`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.reply(sender, `Banned ${player}.`, VerbosityLevel.Reduced);

    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(
      `/pc ${player} was removed from the party and blocked from rejoining by ${sender.preferredName}.`,
    );

    bot.utils.webhookLogger.addMessage(
      `\`${player}\` was banned from the party by \`${sender.preferredName}\`. Reason: \`${reason}\``,
      WebhookMessageType.ActionLog,
      true,
    );

    if (bot.utils.getUserObject({ name: player })) {
      bot.utils.setPermissionRank({
        name: player,
        newPermissionRank: 0,
      });
      const newPlayerPerms = Object.keys(Permissions).find(
        (perm) => Permissions[perm] === newPermissionRank,
      );
      bot.utils.webhookLogger.addMessage(
        `After banning, \`${player}\`'s permission rank was updated to \`${newPlayerPerms}\` (level: \`${newPermissionRank}\`) by \`${sender.username}\`.`,
        WebhookMessageType.ActionLog,
        true,
      );
    }
  },
};
