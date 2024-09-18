import { Permissions } from "../../../utils/Interfaces.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs"

export default {
    name: ["preferredname", "pn"],
    ignore: false,
    description: "Test command",
    permission: Permissions.Admin,
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        if(args.length === 0) return bot.bot.chat(`/w ${sender} Please provide a name!`);
        if(args[0].length > 12) return bot.bot.chat(`/w ${sender} The name you provided is too long! (12 is the max)`);
        bot.utils.setPreferredUsername({ name: sender, preferredName: args[0] });
        bot.reply(`/w ${sender} Your preferred name has been set to ${args[0]}`);
    }
  }
  