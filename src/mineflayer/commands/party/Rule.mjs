import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

/** Timestamp of the last rule message sent */
let lastRuleSentTime = 0;
const COOLDOWN_DURATION = 5_000;

export default {
  name: ["rule"],
  description: "Send a BingoBrewers rule in party chat",
  usage: "!p rule [number]",
  permission: Permissions.ExSplasher,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    const currentTime = Date.now();

    if (currentTime - lastRuleSentTime < COOLDOWN_DURATION) {
      bot.reply(sender, `Rule command is on cooldown!`, VerbosityLevel.Reduced);
      return;
    }

    lastRuleSentTime = currentTime;

    let rule = bot.utils.rulesList[args[0]] ?? bot.utils.rulesList["1"];
    let ruleNum = Object.keys(bot.utils.rulesList).find(
      (key) => bot.utils.rulesList[key] === rule,
    );

    // TODO: update rules (both data & usage system/mechanism)
    // bot.chat("/pc --- Bingo Brewers Rules (Outdated)---");
    bot.chat("/pc --- Bingo Brewers Rules ---", VerbosityLevel.Minimal);
    await bot.utils.delay(bot.utils.minMsgDelay);
    bot.chat(`/pc Rule ${ruleNum}: ${rule}`, VerbosityLevel.Minimal);
  },
};
