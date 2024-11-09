import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["promote", "promo", "prom", "pro"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Promote Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player;
    if (args[0]) {
      player = await bot.utils.getUUID(args[0], true)?.name;
      if (!player) return bot.reply(sender, "Player not found.");
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
