import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["hiderank", "hr", "togglerank"],
  description:
    "Toggle between hiding and showing your rank in party command output",
  usage: "!p hiderank [true|false]",
  permission: Permissions.Splasher,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!bot.utils.getUserObject({ name: sender.username }))
      return bot.reply(
        sender,
        "How are you even able to run this without being in the db??",
        VerbosityLevel.Reduced,
      );
    let newSetting = args[0]?.toLowerCase?.();
    let currentSetting = !!bot.utils.getUserObject({ name: sender.username })
      .hideRank;
    if (newSetting === "true" || newSetting === "false")
      newSetting = newSetting === "true";
    else newSetting = !currentSetting;
    if (newSetting === currentSetting)
      return bot.reply(
        sender,
        `Your rank is already being ${newSetting ? "hidden" : "shown"} in the output of party commands!`,
        VerbosityLevel.Reduced,
      );
    bot.utils.setHideRankSetting({
      name: sender.username,
      hideRank: newSetting,
    });
    bot.reply(
      sender,
      `Your rank is now ${newSetting ? "hidden" : "shown"} in the output of party commands!`,
      VerbosityLevel.Reduced,
    );
  },
};
