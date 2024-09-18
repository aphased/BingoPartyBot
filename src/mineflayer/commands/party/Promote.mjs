import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["promote", "promo"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Promote Command", // Description of the command
    permission: Permissions.Trusted, // Permission level required to execute this command
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {

        let player = args[0] || sender;
        // Code here
        bot.reply(`/pc ${sender} has promoted ${player} in the party.`);
        setTimeout(() => {
            bot.reply("/p promote " + player);
            bot.webhook.send(
                {
                    username: bot.config.webhook.name,
                },
                {
                    content: `Promoted ${player} in the party. Command executed by ${sender}`,
                }
            );
        }, 1000)
    }
  }
  