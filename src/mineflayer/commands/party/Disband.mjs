import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["disband"],
  description: "Disband the party after a 10 second delay. Avoid using this.",
  usage: "!p disband [reason]",
  permission: Permissions.Admin,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let reason = args.slice(0).join(" ") || "No reason given.";
    bot.chat(
      `/pc Party disband was triggered by ${sender.preferredName}. 10 seconds remaining until the party is disbanded!`,
    );
    bot.utils.activeDisband = setTimeout(() => {
      bot.utils.activeDisband = null;
      bot.chat("/p disband");
      bot.utils.webhookLogger.addMessage(
        `The party was disbanded by \`${sender.preferredName}\`. Reason: \`${reason}\``,
        WebhookMessageType.ActionLog,
        true,
      );
    }, 10000);
  },
};
