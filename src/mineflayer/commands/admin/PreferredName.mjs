import { Permissions } from "../../../utils/Interfaces.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["preferredname", "pn"],
  ignore: false,
  description: "Sets your preferred name so the bot knows what to call you",
  permission: Permissions.Admin,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args.length === 0)
      return bot.reply(sender.username, "Please provide a name!");
    if (args[0].length > 16)
      return bot.reply(
        sender.username,
        "The name you provided is too long! (16 is the max)",
      );
    bot.utils.setPreferredUsername({ name: sender, preferredName: args[0] });
    bot.reply(
      sender.username,
      `Your preferred name has been set to ${args[0]}`,
    );
  },
};
