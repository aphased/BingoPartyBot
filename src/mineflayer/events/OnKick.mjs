import { WebhookMessageType } from "../../utils/Interfaces.mjs";

export default {
  name: "Kick Event",
  description: "The message event stuff",
  /**
   *
   * @param {import("../Bot.mjs").default} bot
   */
  execute: async function (bot, reason, loggedIn) {
    const reasonstr = JSON.parse(reason)?.extra?.[0]?.text;
    bot.utils.log(`Kicked from server ${loggedIn ? "" : "during login "}for reason: ${reasonstr} (${reason})`, "Error");
    bot.utils.webhookLogger.addMessage(
      `Kicked from server ${loggedIn ? "" : "during login "}for reason: ${reasonstr}`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
