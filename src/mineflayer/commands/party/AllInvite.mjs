import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["allinvite", "allinv", "ai"],
  description: "Toggle the allinvite party setting",
  usage: "!p allinvite",
  permission: Permissions.Trusted,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.chat(`/pc ${sender.preferredName} toggled the All Invite setting.`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat("/p settings allinvite");
    bot.utils.webhookLogger.addMessage(
      `\`${sender.preferredName}\` toggled the All Invite party setting.`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
