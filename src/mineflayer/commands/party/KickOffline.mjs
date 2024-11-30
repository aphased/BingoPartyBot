import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["kickoffline", "kickafk", "ko", "ka"],
  description: "Kick offline players from the party",
  usage: "!p kickoffline",
  permission: Permissions.HoB,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat("/p kickoffline");
    bot.utils.webhookLogger.addMessage(
      `Offline players were purged from the party by \`${sender.preferredName}\`.`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
