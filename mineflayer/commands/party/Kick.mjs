import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["kick", "remove"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Kick Command", // Description of the command
    permission: Permissions.Trusted, // Permission level required to execute this command
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {

        let player = args[0];
        if(!player) return bot.bot.chat(`/w ${sender} Please provide a player to kick.`);
        bot.bot.chat(`/pc ${sender} has kicked ${player} from the party.`);
        setTimeout(() => {
            bot.bot.chat("/p kick " + player);
            bot.webhook.send(
                {
                    username: bot.config.webhook.name,
                },
                {
                    content: `Kicked ${player} from the party. Command executed by ${sender}`,
                }
            );
        }, 1000)
    }
  }
  