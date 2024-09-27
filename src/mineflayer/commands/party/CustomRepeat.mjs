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
    if (isNaN(repetitions)) repetitions = 5;
    if (repetitions > 7) repetitions = 7;
    let duration = parseInt(args[1]);
    if (isNaN(duration)) duration = 2;
    bot.chat(`/pc ${sender.username}: ${args.slice(2).join(" ")}`);
    repetitions--;
    for (let i = 0; i < repetitions; i++) {
      setTimeout(() => {
        bot.chat(`/pc ${sender.username}: ${args.slice(2).join(" ")}`);
      }, (i + 1) * (duration * 1000));
    }
  },
};
