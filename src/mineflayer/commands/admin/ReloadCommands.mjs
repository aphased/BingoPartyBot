import { Permissions } from "../../../utils/Interfaces.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs"

export default {
    name: ["reload"],
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
        await bot.reloadPartyCommands().then(x => {
            bot.reply(`/w ${sender} Reloaded commands!`);
        })
    }
  }
  