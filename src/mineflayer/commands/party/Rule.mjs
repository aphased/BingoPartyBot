import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["rule"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Rule Command", // Description of the command
  permission: Permissions.ExSplasher, // Permission level required to execute
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let ruleNum = args[0] || "1";
    let rule = bot.utils.rulesList[ruleNum];
    if (!rule) {
      bot.reply(sender.username, "Rule not found.");
      return;
    }
    bot.chat("/pc --- Bingo Brewers Rules (Outdated)---");
    setTimeout(() => {
      bot.chat(`/pc Rule ${ruleNum}: ${rule}`);
    }, 550);
  },
};
