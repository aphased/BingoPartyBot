import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["unban", "unblock"],
  description: "Unblock a player (`/block remove`).",
  usage: "!p unban <username>",
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
    } else
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    bot.reply(sender, `Trying to unban ${player}...`, VerbosityLevel.Reduced);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/lobby`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/block remove ${player}`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.reply(sender, `Unbanned ${player}.`, VerbosityLevel.Reduced);
    bot.utils.webhookLogger.addMessage(
      `\`${player}\` was unbanned from the party by \`${sender.preferredName}\`.`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
