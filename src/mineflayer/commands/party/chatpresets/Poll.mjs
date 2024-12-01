import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["poll"],
  description: "Send one of several predefined polls in party chat",
  usage: "!p poll <spellbingo|goalscompleted|playtime|splashwhen>",
  permission: Permissions.Trusted,

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
    else if (["splash", "splashwhen"].includes(args[0]))
      poll =
        "When do we need a splash?/now!/in 5-10min/in 20-30min/in >30min/in >1h";
    else if (["pt", "playtime"].includes(args[0])) {
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
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );

    bot.chat(`/p poll ${poll}`);
  },
};
