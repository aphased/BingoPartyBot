import { Permissions } from "../../../utils/Interfaces.mjs";

let lastFetchurSentTime = 0;
const COOLDOWN_DURATION = 30_000;

export default {
  name: ["fetchur", "fetchuritem", "fetchursitem"],
  description: "Retrieve the item Fetchur asks for, optionally for a given day (defaults to today; CET timezone).",
  usage: "!p fetchur [day]",
  permission: Permissions.ExSplasher, // no permission level should be required
  isPartyChatCommand: true,

  /**
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    const currentTime = Date.now();

    if (currentTime - lastFetchurSentTime < COOLDOWN_DURATION) {
      bot.utils.log(
        "No posting Fetchur's item again. (<30s passed since last share message)",
        "Info",
      );
      bot.reply(
          sender,
          `Guide command is on cooldown!`,
          VerbosityLevel.Reduced,
      );
      return;
    }
    lastFetchurSentTime = currentTime;
    
    const responses = [
      "On Day 1 of Bingo, Fetchur asks for 20 yellow stained glass. Buy it from the Wool Weaver NPC in the Hub.",
      "On Day 2 of Bingo, Fetchur asks for one Compass. Craft it with one Redstone Dust in the middle and 4 Iron Ingots around it.",
      "On Day 3 of Bingo, Fetchur asks for 20 Mithril. Mine them in the Dwarven Mines with a Diamond or Mithril Pickaxe.",
      "On Day 4 of Bingo, Fetchur asks for one Firework Rocket. Craft it with one Paper and one Gunpowder.",
      "On Day 5 of Bingo, Fetchur asks for any type of Coffee. Get a Cheap Coffee from the Bartender NPC in the Hub.",
      "On Day 6 of Bingo, Fetchur asks for one Iron or Wood Door. Craft it using 6 Iron Ingots or Wood Blocks.",
      
      "On Day 7 of Bingo, Fetchur asks for three Rabbit's Foot. Obtain them by killing Rabbits in the Oasis on Mushroom Desert.",
      "On Day 8 of Bingo, Fetchur asks for one Superboom TNT. Buy it from the Walter NPC in Gunpowder Mines.",
      "On Day 9 of Bingo, Fetchur asks for one Pumpkin. Break a Pumpkin in the Barn to get them.",
      "On Day 10 of Bingo, Fetchur asks for one Flint and Steel. Craft it using an Iron Ingot and Flint.",
      "On Day 11 of Bingo, Fetchur asks for 50 Emeralds. Mine them in the Slimehill or Dwarven Mines.",
      "On Day 12 of Bingo, Fetchur asks for 50 Red Wool. Buy it from the Wool Weaver NPC in the Hub.",
      "On Day 13 of Bingo, Fetchur asks for 20 yellow stained glass once again. Buy it from the Wool Weaver NPC in the Hub.",
      "On Day 14 of Bingo, Fetchur asks for one Compass once again. Craft it with one Redstone Dust in the middle and 4 Iron Ingots around it."
    ];

    const today = new Date();
    const dayInMonth = today.getDate();
    
    let day = parseInt(args[0], 10);
    if (isNaN(day)) day = dayInMonth <= 7 ? dayInMonth : 0; // plan to support extreme events by using api to check if extreme is upcoming

    let response;
    if (day >= 1 && day <= responses.length) {
      response = responses[day - 1];
    } else if (day === 0) {
      response = "The next Bingo event has not started yet! Check back again when it is under way!";
    } else if (dayInMonth > responses.length) {
      response = "This Bingo event has concluded! Try again next Bingo!";
    } else {
      response = `Your entry (${args[0]}) is invalid. Please try again with an integer between 1 and 7.`; // same thing here as above
    }

    bot.utils.webhookLogger.addMessage(response, WebhookMessageType.ActionLog, true);
  },
};
