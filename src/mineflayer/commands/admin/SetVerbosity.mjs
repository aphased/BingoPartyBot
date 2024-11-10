import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["setverbosity", "verbosity"],
  description: "Set the bot's verbosity level for in-game message output",
  usage: "!p setverbosity <verbosity level> [confirm]",
  permission: Permissions.Admin,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let newVerbosity;
    if (isNaN(args[0]))
      newVerbosity = Object.keys(VerbosityLevel).find(
        (key) => key.toLowerCase() === args[0]?.toLowerCase(),
      );
    else
      newVerbosity = Object.keys(VerbosityLevel).find(
        (key) => VerbosityLevel[key] === parseInt(args[0]),
      );
    if (!newVerbosity)
      return bot.reply(
        sender,
        `Invalid verbosity level. Valid options are '${Object.keys(VerbosityLevel).join("', '")}' or the corresponding integers.`,
        VerbosityLevel.Reduced,
      );
    if (VerbosityLevel[newVerbosity] === bot.verbosityLevel)
      return bot.reply(
        sender,
        `The bot's verbosity level is already ${newVerbosity} (level: ${VerbosityLevel[newVerbosity]})!`,
        VerbosityLevel.Reduced,
      );
    if (
      VerbosityLevel[newVerbosity] === VerbosityLevel.Off &&
      args[1] !== "confirm"
    )
      return bot.reply(
        sender,
        "You are about to disable all in-game chat messages. If you want to proceed, append 'confirm' to the command.",
        VerbosityLevel.Minimal,
      );
    bot.verbosityLevel = VerbosityLevel[newVerbosity];
    bot.reply(
      sender,
      `The bot's verbosity level is now ${newVerbosity} (level: ${VerbosityLevel[newVerbosity]}).`,
      VerbosityLevel.Reduced,
    );
    bot.utils.webhookLogger.addMessage(
      `The bot's verbosity level was set to \`${newVerbosity}\` (level: \`${VerbosityLevel[newVerbosity]}\`) by \`${sender.preferredName}\`.`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
