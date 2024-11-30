import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["promote", "promo", "prom", "pro"],
  description: "Promote someone else or yourself to party moderator",
  usage: "!p promote [username]",
  permission: Permissions.Trusted,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player;
    if (args[0]) {
      player = await bot.utils.usernameExists(args[0]);
      if (player === false)
        return bot.reply(sender, "Player not found.", VerbosityLevel.Reduced);
    } else player = sender.username;
    bot.chat(`/pc ${player} was promoted by ${sender.preferredName}`);
    setTimeout(() => {
      bot.chat(`/p promote ${player}`);
      bot.utils.webhookLogger.addMessage(
        `\`${player}\` was party promoted by \`${sender.preferredName}\``,
        WebhookMessageType.ActionLog,
        true,
      );
    }, bot.utils.minMsgDelay);
  },
};
