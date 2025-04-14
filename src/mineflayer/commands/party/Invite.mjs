import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["invite", "inv"],
  description: "Invite someone to the party. Defaults to yourself.",
  usage: "!p invite [username]",
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
      player = await bot.utils.usernameExists(args[0]);
      if (player === false)
        return bot.reply(sender, "Player not found.", VerbosityLevel.Reduced);
    } else player = sender.username;
    bot.chat(`/p invite ${player}`);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/pc ${sender.preferredName} invited ${player} to the party.`);
  },
};
