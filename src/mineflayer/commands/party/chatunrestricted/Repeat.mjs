import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["repeat", "rep", "customrepeat", "crep", "customrep"],
  description:
    "Automatically repeat your chat message in party chat with optional custom values",
  usage: "!p repeat [repetitions] [delay] <message>",
  permission: Permissions.Staff,
  // Command allows arbitrary chat output!

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   * @param {import("../../EXAMPLECOMMAND.mjs").default} internalOptions.callerCommand
   * @param {Boolean} internalOptions.includePrefix
   */
  execute: async function (
    bot,
    sender,
    args,
    internalOptions = { callerCommand: this, includePrefix: true },
  ) {
    let repetitions = parseInt(args[0]);
    let duration = parseFloat(args[1]);
    let startIndex = 2;
    if (isNaN(duration)) {
      duration = 2;
      startIndex--;
    }
    if (duration < 0.5) duration = 0.5;
    if (duration > 9) duration = 9;
    if (isNaN(repetitions)) {
      repetitions = 5;
      startIndex--;
    }
    if (repetitions > 7) repetitions = 7;

    if (args.length < 1 + startIndex)
      return bot.reply(
        sender,
        `Invalid command usage! Use: ${internalOptions?.callerCommand?.usage}`,
        VerbosityLevel.Reduced,
      );

    for (let i = 0; i < repetitions; i++) {
      bot.utils
        .getCommandByAlias(bot, "say")
        .execute(bot, sender, args.slice(startIndex), internalOptions);
      await bot.utils.delay(duration * 1000);
    }
  },
};
