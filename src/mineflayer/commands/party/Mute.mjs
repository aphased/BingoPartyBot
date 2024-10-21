import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["mute", "unmute"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Mute Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let reason = args.join(" ") || "No reason given.";
    bot.chat("/p mute");
    setTimeout(() => {
      bot.chat(`/pc Party mute was toggled by ${sender.preferredName}.`);
      bot.utils.webhookLogger.addMessage(
        `Party mute was toggled by \`${sender.preferredName}\`. Reason: \`${reason}\``,
        WebhookMessageType.ActionLog,
        true,
      );
    }, bot.utils.minMsgDelay);
  },
};
