import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["customrep", "customrepeat", "crep", "crepeat"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Repeat Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let repetitions = parseInt(args[0]);
    let delay = parseFloat(args[1]);
    let startIndex = 2;
    if (isNaN(delay)) {
      delay = 2;
      startIndex--;
    }
    if (delay < 0.5) delay = 0.5;
    if (delay > 9) delay = 9;
    if (isNaN(repetitions)) {
      repetitions = 5;
      startIndex--;
    }
    if (repetitions > 7) repetitions = 7;

    if (args.length < 1 + startIndex) {
      bot.reply(sender, "Invalid command usage!");
      await bot.utils.waitForDelay(bot.utils.minMsgDelay);
      bot.reply(
        sender,
        "To use this command, use: !p customrepeat <repetitions> <delay> <message>",
      );
      await bot.utils.waitForDelay(bot.utils.minMsgDelay);
      bot.reply(sender, "For example: !p crep 5 1 Hello world!");
    }

    for (let i = 0; i < repetitions; i++) {
      bot.chat(`/pc ${sender.username}: ${args.slice(startIndex).join(" ")}`);
      await bot.utils.waitForDelay(bot.utils.minMsgDelay);
    }
  },
};
