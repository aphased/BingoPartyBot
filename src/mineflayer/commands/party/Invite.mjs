import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["invite", "inv"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Invite Command", // Description of the command
  permission: Permissions.HoB,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player;
    if (args[0]) {
      player = await bot.utils.getUUID(args[0], true)?.name;
      if (!player)
        return bot.reply(sender, "Player not found.", VerbosityLevel.Reduced);
    } else player = sender.username;
    bot.chat(`/p invite ${player}`);
    setTimeout(() => {
      bot.chat(`/pc ${sender.preferredName} invited ${player} to the party.`);
    }, bot.utils.minMsgDelay);
  },
};
