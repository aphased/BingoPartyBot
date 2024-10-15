import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["repeat", "rep"], // This command will be triggered by either command1 or command2
  // TODO: (potentially as a separate command) bring back !p customrepeat (plus custom aliases)
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
    let startIndex = 1;
    if (isNaN(repetitions)) {
      repetitions = 5;
      startIndex = 0;
    }
    if (repetitions > 7) repetitions = 7;

    if (args.length < 1 + startIndex) {
      bot.reply(sender, "Invalid command usage!");
      setTimeout(() => {
        bot.reply(sender, "To use this command, use: !p repeat <repetitions> <message>")
        setTimeout(() => {
          bot.reply(sender, "For example: !p rep 5 Hello world!")
        }, bot.utils.minMsgDelay)
      }, bot.utils.minMsgDelay)
      return;
    }

    for (let i = 0; i < repetitions; i++) {
      setTimeout(() => {
        bot.chat(`/pc ${sender.preferredName}: ${args.slice(startIndex).join(" ")}`);
      }, i * 2000);
    }
  },
};
