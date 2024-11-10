import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["poll"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Send a predefined poll in party chat", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let poll;
    if (["bingo", "spellbingo"].includes(args[0]))
      poll = "Spell 'Bingo'!/B/I/N/G/O";
    else if (["goals", "goalscompleted"].includes(args[0]))
      poll = "How many goals have you completed so far?/<5/5-10/11-15/16-19/20";
    else if (["playtime"].includes(args[0])) {
      // dynamic values depending on the day of month (slightly skewed due to timezones, unimportant though)
      const dayOfMonth = new Date().getDate();
      if (dayOfMonth <= 2)
        poll =
          "How much playtime are you at currently?/<1h/1-4h/5-9h/10-16h/>16h";
      else if (dayOfMonth <= 5)
        poll =
          "How much playtime are you at currently?/<3h/3-8h/9-16h/16-25h/>25h";
      else
        poll =
          "How much playtime are you at currently?/<5h/5-10h/11-20h/21-30h/>30h";
    } else
      return bot.reply(
        sender,
        "Invalid poll option! Usage: !p poll <option>. Choose one of the following options: 'spellbingo', 'goalscompleted', 'playtime'",
        VerbosityLevel.Reduced,
      );

    bot.chat(`/p poll ${poll}`);
  },
};
