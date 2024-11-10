import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["setverbosity", "verbosity"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Set the bot's verbosity level for in-game message output", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command

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
