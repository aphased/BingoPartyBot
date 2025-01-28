import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["repeat", "rep", "customrepeat", "crep", "customrep"],
  description:
    "Repeat any message in party chat multiple times. Restricted due to allowing arbitrary messages.",
  usage: "!p repeat [repetitions] [delay] <message>",
  permission: Permissions.Staff,
  // Command allows arbitrary chat output!

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args, callerCommand = null) {
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
        `Invalid command usage! Use: ${callerCommand ? callerCommand.usage : this.usage}`,
        VerbosityLevel.Reduced,
      );

    for (let i = 0; i < repetitions; i++) {
      bot.utils
        .getCommandByAlias(bot, "say")
        .execute(bot, sender, args.slice(startIndex), callerCommand ?? this);
      await bot.utils.delay(duration * 1000);
    }
  },
};
