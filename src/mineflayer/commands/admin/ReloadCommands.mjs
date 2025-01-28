import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["reload", "reloadcommands", "load"],
  description: "Reload all commands from their file.",
  usage: "!p reload",
  permission: Permissions.Owner,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    await bot.reloadPartyCommands().then(() => {
      bot.reply(sender, "Reloaded commands!", VerbosityLevel.Reduced);
    });
  },
};
