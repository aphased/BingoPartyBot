import { Permissions } from "../../../utils/Interfaces.mjs";
import Utils from "../../../utils/Utils.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs"

export default {
    name: ["getuser"],
    ignore: false,
    description: "Test command",
    permission: Permissions.Owner,
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        let user = args[0];
        let uuid = await bot.utils.getUUID(user);
        if(!uuid) return bot.reply(`/w ${sender} User not found!`);
        let playerNames = bot.utils.playerNamesDatabase.get("data");
        let index = playerNames.findIndex(x => x.accounts.find(y => y.uuid === uuid));
        if(index === -1) return bot.reply(`/w ${sender} User does not exist!`);
        let userObj = playerNames[index];
        let rank = Object.keys(Permissions).find(x => Permissions[x] === userObj.permissionRank);
        bot.reply(`/w ${sender} User: ${user} Rank: ${rank} (Level: ${userObj.permissionRank})`);
    }
  }
  