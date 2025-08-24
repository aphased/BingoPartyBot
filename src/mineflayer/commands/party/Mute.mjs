import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["mute", "unmute"],
  description: "Mute/Unmute the party",
  usage: "!p mute [reason]",
  permission: Permissions.Trusted,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    const reason = args.join(" ") || "No reason given.";
    
    bot.chat("/p mute");
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/pc Party mute was toggled by ${sender.preferredName}.`);
    
    bot.utils.webhookLogger.addMessage(
      `Party mute was toggled by \`${sender.preferredName}\`. Reason: \`${reason}\``,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
