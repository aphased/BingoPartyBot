import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["transfer"],
  description: "Transfer the party to someone else. Avoid using this.",
  usage: "!p transfer <username>",
  permission: Permissions.Trusted,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player;
    if (args[0]) {
      player = await bot.utils.usernameExists(args[0]);
      if (player === false)
        return bot.reply(sender, "Player not found.", VerbosityLevel.Reduced);
      /* TODO: a check could (potentially) be added here if the transferred-to
      player has the MVP++ rank (but bypassable by `confirm`ing the command)… */
    } else
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    bot.chat(
      `/pc The party was transferred to ${player} by ${sender.preferredName}.`,
    );
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/p transfer ${args[0]}`);
    bot.utils.webhookLogger.addMessage(
      `The party was transferred to \`${player}\` by \`${sender.preferredName}\`.`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
