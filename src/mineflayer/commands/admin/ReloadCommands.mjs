import { Permissions } from "../../../utils/Interfaces.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["reload", "load"],
  ignore: false,
  description: "Reloads all modifications to commands",
  permission: Permissions.Owner,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    await bot.reloadPartyCommands().then((x) => {
      bot.reply(sender.username, "Reloaded commands!");
    });
  },
};
