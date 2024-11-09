import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["drain", "empty"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Empties the party after a 10 second delay", // Description of the command
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
      `/pc Party drain was triggered by ${sender.preferredName}. 10 seconds remaining until the party is emptied!`,
    );
    bot.utils.activeDrain = setTimeout(() => {
      bot.utils.activeDrain = null;
      bot.chat("/streamgui settings empty");
      bot.utils.webhookLogger.addMessage(
        `The party was emptied by \`${sender.preferredName}\` Reason: \`${reason}\``,
        WebhookMessageType.ActionLog,
        true,
      );
    }, 10000);
  },
};
