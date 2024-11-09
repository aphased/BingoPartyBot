import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["disband"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Disbands the party after a 10 second delay", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command

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
