import { Permissions, WebhookMessageType } from "../../../utils/Interfaces.mjs";

export default {
  name: ["transfer"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Transfer Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player;
    if (args[0]) {
      player = await bot.utils.getUUID(args[0], true)?.name;
      if (!player) return bot.reply(sender, "Player not found.");
    } else
      return bot.reply(
        sender,
        "Please provide a username to transfer the party to.",
      );
    bot.chat(
      `/pc The party was transferred to ${player} by ${sender.preferredName}.`,
    );
    setTimeout(() => {
      bot.chat(`/p transfer ${args[0]}`);
      bot.utils.webhookLogger.addMessage(
        `The party was transferred to \`${player}\` by \`${sender.preferredName}\`.`,
        WebhookMessageType.ActionLog,
        true,
      );
    }, bot.utils.minMsgDelay);
  },
};
