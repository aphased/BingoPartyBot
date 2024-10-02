import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["customrep", "customrepeat", "crep", "crepeat"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Repeat Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute

  // this command is VERY broken and i dont know why, ive tried during duration * 1000 but that doesnt work

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
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
    if(duration < 0.5) duration = 0.5;
    if(duration > 9) duration = 9;
    if(isNaN(repetitions)) {
      repetitions = 5;
      startIndex--;
    }
    if (repetitions > 7) repetitions = 7;

    if (args.length < 1 + startIndex) {
      bot.reply(sender, "Invalid command usage!");
      setTimeout(() => {
        bot.reply(sender, "To use this command, use: !p customrepeat <repetitions> <duration> <message>")
        setTimeout(() => {
          bot.reply(sender, "For example: !p rep 5 1 Hello world!")
        }, bot.utils.minMsgDelay)
      }, 550)
      return;
    }

    for (let i = 0; i < repetitions; i++) {
      setTimeout(() => {
        bot.chat(`/pc ${sender.username}: ${args.slice(startIndex).join(" ")}`);
      }, i * (duration * 1000));
    }
  },
};
