import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["customrepeat", "customrep", "crep", "crepeat"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Repeat Command", // Description of the command
  permission: Permissions.Staff, // Permission level required to execute
  // Command allows arbitrary chat output!

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
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
        "Invalid command usage! Use: !p customrepeat <repetitions> <duration> <message>",
        VerbosityLevel.Reduced,
      );

    for (let i = 0; i < repetitions; i++) {
      setTimeout(
        () => {
          bot.utils
            .getCommandByAlias(bot, "say")
            .execute(bot, sender, args.slice(startIndex));
        },
        i * (duration * 1000),
      );
    }
  },
};
