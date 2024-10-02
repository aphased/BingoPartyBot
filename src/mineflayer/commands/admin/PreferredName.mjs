import { Permissions } from "../../../utils/Interfaces.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["preferredname", "pn", "name"],
  ignore: false,
  description: "Sets your preferred name so the bot knows what to call you",
  permission: Permissions.Owner,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args.length === 0)
      return bot.reply(sender, "Please provide a name!");
    if (args[0].length > 16) {
      bot.reply(
        sender,
        "The preferred name you provided is too long!",
      ),
        setTimeout(() => {
          bot.reply(
            sender,
            "The limit for preferred names is 16 characters.",
          );
        }, bot.utils.minMsgDelay);
    }
    bot.utils.setPreferredUsername({ name: sender.username, preferredName: args[0] });
    bot.reply(
      sender,
      `Your preferred name has been set to ${args[0]}.`,
    );
  },
};
