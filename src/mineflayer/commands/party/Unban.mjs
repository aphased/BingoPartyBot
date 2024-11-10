import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["unban", "unblock"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Unban Command", // Description of the command
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
      if (!player)
        return bot.reply(sender, "Player not found.", VerbosityLevel.Reduced);
    } else
      return bot.reply(
        sender,
        "Please provide a player to unban.",
        VerbosityLevel.Reduced,
      );
    bot.reply(sender, `Trying to unban ${player}...`, VerbosityLevel.Reduced);
    setTimeout(() => {
      bot.chat(`/lobby`);
      setTimeout(() => {
        bot.chat(`/block remove ${player}`);
        setTimeout(() => {
          bot.reply(sender, `Unbanned ${player}.`, VerbosityLevel.Reduced);
          bot.utils.webhookLogger.addMessage(
            `\`${player}\` was unbanned from the party by \`${sender.preferredName}\`.`,
            WebhookMessageType.ActionLog,
            true,
          );
        }, bot.utils.minMsgDelay);
      }, bot.utils.minMsgDelay);
    }, bot.utils.minMsgDelay);
  },
};
