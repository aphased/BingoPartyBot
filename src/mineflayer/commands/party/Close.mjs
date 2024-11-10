import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["close", "private"],
  description: "Close the party to the public",
  usage: "!p close [reason]",
  permission: Permissions.Staff,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let reason = args.slice(0).join(" ") || "No reason given.";
    bot.chat(`/pc The party was closed by ${sender.preferredName}.`);
    setTimeout(() => {
      bot.chat(`/stream close`);
      bot.utils.webhookLogger.addMessage(
        `The party was closed by \`${sender.preferredName}\`. Reason: \`${reason}\``,
        WebhookMessageType.ActionLog,
        true,
      );
    }, bot.utils.minMsgDelay);
  },
};
