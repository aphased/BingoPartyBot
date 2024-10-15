import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["stream", "public", "open"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description:
    "Opens the party to the public, or reopens it if an incompetant person transfers to themself without MVP++", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // The number of party slots count to open up for rarely, if ever, has a
    // reason not to be 100. If it isn't integer (or over the maximum), we use
    // the maximum as default.

    // Hypixel's lowest for a public party is a maximum of two members, but
    // that does not really make sense for the bingo party. Adapt as needed
    // in practice.
    let minimumPartySlots = 10; // or really any of 20, 30, …
    let maximumPartySlots = 100; // Hypixel server-given limit

    // This only assigns user input as the maximum party size if it's valid, and
    // sticks with maximum possible (rather than minimum) size otherwise
    let amount = Math.max(
      minimumPartySlots,
      Math.min(maximumPartySlots, parseInt(args[0]) || maximumPartySlots),
    );

    bot.chat(`/pc Party size was set to ${amount} by ${sender.preferredName}.`);
    setTimeout(() => {
      bot.chat(`/stream open ${amount}`);
      bot.webhook.send(
        {
          username: bot.config.webhook.name,
        },
        {
          content: `Party size was set to \`${amount}\` by \`${sender.preferredName}\`.`,
        },
      );
    }, bot.utils.minMsgDelay);
  },
};
