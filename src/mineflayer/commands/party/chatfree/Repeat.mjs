import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["repeat", "rep"], // This command will be triggered by either command1 or command2
  // TODO: (potentially as a separate command) bring back !p customrepeat (plus custom aliases)
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
    let startIndex = 1;
    if (isNaN(repetitions)) {
      repetitions = 5;
      startIndex = 0;
    }
    if (repetitions > 7) repetitions = 7;

    if (args.length < 1 + startIndex) {
      return bot.reply(
        sender,
        "Invalid command usage! Use: !p repeat <repetitions> <message>",
        VerbosityLevel.Reduced,
      );
    }

    for (let i = 0; i < repetitions; i++) {
      setTimeout(() => {
        bot.utils
          .getCommandByAlias(bot, "say")
          .execute(bot, sender, args.slice(startIndex));
      }, i * 2000);
    }
  },
};
