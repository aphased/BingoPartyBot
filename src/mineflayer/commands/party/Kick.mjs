import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["kick", "remove"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Kick Command", // Description of the command
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
        "Please provide a player to kick.",
        VerbosityLevel.Reduced,
      );
    let reason = args.slice(1).join(" ") || "No reason given.";
    if (!bot.utils.isHigherRanked(sender.username, player)) {
      return;
    }
    bot.chat(
      `/pc ${player} was kicked from the party by ${sender.preferredName}.`,
    );
    setTimeout(() => {
      bot.chat(`/p kick ${player}`);
      bot.utils.webhookLogger.addMessage(
        `\`${player}\` was kicked from the party by \`${sender.preferredName}\`. Reason: \`${reason}\``,
        WebhookMessageType.ActionLog,
        true,
      );
    }, bot.utils.minMsgDelay);
  },
};
