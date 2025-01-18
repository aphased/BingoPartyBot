import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["flea", "bossflea", "bf"],
  description:
    "Repeat any message in party chat with predefined parameters. Restricted due to allowing arbitrary messages.",
  usage: "!p flea <message>",
  permission: Permissions.Staff,
  // Command allows arbitrary chat output!

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args, callerCommand = null) {
    // This commands produces a splash message to party chat, "BossFlea style":
    // 4 repetitions à 4 seconds apart, then a pause of 20 seconds, then a
    // final fifth one

    if (args.length < 1)
      return bot.reply(
        sender,
        `Invalid usage! Use: ${callerCommand ? callerCommand.usage : this.usage}`,
        VerbosityLevel.Reduced,
      );

    bot.utils
      .getCommandByAlias(bot, "repeat")
      .execute(
        bot,
        sender,
        `4 4 ${args.join(" ")}`.split(" "),
        callerCommand ?? this,
      );

    await bot.utils.delay(12_000 + 20_000);
    bot.utils
      .getCommandByAlias(bot, "say")
      .execute(bot, sender, args, callerCommand ?? this);
  },
};
