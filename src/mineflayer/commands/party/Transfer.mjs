import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["transfer"],
  description: "Transfer the party to someone else",
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
      player = await bot.utils.getUUID(args[0], true);
      if (player === false)
        return bot.reply(sender, "Player not found.", VerbosityLevel.Reduced);
      // proceed with raw provided name if api request failed for any reason (uncertain validity)
      player = player ? player.name : args[0];
    } else
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
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
