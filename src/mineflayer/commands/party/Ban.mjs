import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["ban", "block"],
  description: "Kick and `/block add` a player to prevent them from rejoining.",
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
    if (!player)
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    let reason = args.slice(1).join(" ") || "No reason given.";
    if (!bot.utils.isHigherRanked(sender.username, player)) {
      return;
    }
    bot.chat(
      `/pc ${player} was removed from the party and blocked from rejoining by ${sender.preferredName}.`,
    );
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/lobby`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/p kick ${player}`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/block add ${player}`);
    bot.utils.webhookLogger.addMessage(
      `\`${player}\` was banned from the party by \`${sender.preferredName}\`. Reason: \`${reason}\``,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
