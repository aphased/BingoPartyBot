import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["kickoffline", "kickafk", "ko", "ka"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Kick Offline Command", // Description of the command
  permission: Permissions.HoB, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    setTimeout(() => {
      bot.chat("/p kickoffline");
      bot.utils.webhookLogger.addMessage(
        `Offline players were purged from the party by \`${sender.preferredName}\`.`,
        WebhookMessageType.ActionLog,
        true,
      );
    }, bot.utils.minMsgDelay);
  },
};
