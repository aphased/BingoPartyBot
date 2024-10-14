import { Permissions } from "../../../utils/Interfaces.mjs";

/** Timestamp of the last rule message sent */
let lastRuleSentTime = 0;
const COOLDOWN_DURATION = 5_000;

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
    const currentTime = Date.now();

    if (currentTime - lastRuleSentTime < COOLDOWN_DURATION) {
      bot.reply(
        sender,
        `Rule command is on cooldown!`,
      );
      return;
    }

    lastRuleSentTime = currentTime;

    let ruleNum = args[0] || "1";
    let rule = bot.utils.rulesList[ruleNum];
    if (!rule) {
      bot.reply(sender, "Rule not found.");
      return;
    }
    // TODO: update rules (both data & usage system/mechanism)
    // bot.chat("/pc --- Bingo Brewers Rules (Outdated)---");
    bot.chat("/pc --- Bingo Brewers Rules ---");
    setTimeout(() => {
      bot.chat(`/pc Rule ${ruleNum}: ${rule}`);
    }, bot.utils.minMsgDelay);
  },
};
