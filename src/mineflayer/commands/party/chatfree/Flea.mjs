import { Permissions } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["flea", "bossflea", "bf"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Special flavor of/extra alias for a custom repeat command", // Description of the command
  permission: Permissions.Staff, // Permission level required to execute
  // Command allows arbitrary chat output!
  
  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // This commands produces a splash message to party chat, "BossFlea style":
    // 4 repetitions à 4 seconds apart, then a pause of 20 seconds, then a
    // final fifth one

    bot.utils
      .getCommandByAlias(bot, "customrepeat")
      .execute(bot, sender, `4 4 ${args.join(" ")}`.split(" "));

    setTimeout(() => {
      bot.utils.getCommandByAlias(bot, "say").execute(bot, sender, args);
    }, 12_000 + 20_000);
  },
};