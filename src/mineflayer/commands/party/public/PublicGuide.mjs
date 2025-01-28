import { Permissions } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["!guide", "!gd"],
  description:
    "Send a link to this month's bingo guide in party chat. (public command)",
  usage: "!guide",
  isPartyChatCommand: true,

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.utils.getCommandByAlias(bot, "guide").execute(bot, sender, args, true);
  },
};
