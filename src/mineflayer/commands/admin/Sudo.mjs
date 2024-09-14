import { Permissions } from "../../../utils/Interfaces.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["sudo"],
  ignore: false,
  description: "Test command",
  permission: Permissions.Staff, // TODO: change this to on a per-player basis instead of per-rank?
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.bot.chat(args.join(" "));
    bot.reply(sender, `Executed command: ${args.join(" ")}`);
  },
};
