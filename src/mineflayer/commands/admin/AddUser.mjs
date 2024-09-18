import { Permissions } from "../../../utils/Interfaces.mjs";
import Utils from "../../../utils/Utils.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs"

export default {
    name: ["adduser"],
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
        let rank = args[1];
        rank = Utils.capitalizeFirstLetter(rank);
        let uuid = await bot.utils.getUUID(user);
        if(!uuid) return bot.reply(`/w ${sender} User not found!`);
        let playerNames = bot.utils.playerNamesDatabase.get("data");
        if(playerNames.find(x => x.accounts.find(y => y.uuid === uuid))) return bot.reply(`/w ${sender} User already exists!`);
        let rankNum = Permissions[rank];
        if(!rankNum) return bot.reply(`/w ${sender} Invalid rank!`);
        playerNames.push({
            accounts: [
                {
                    name: user,
                    uuid: uuid
                }
            ],
            permissionRank: rankNum
        });
        bot.utils.playerNamesDatabase.set("data", playerNames);
        bot.reply(`/w ${sender} Added user ${user} with rank ${rank}`);
    }
  }
  