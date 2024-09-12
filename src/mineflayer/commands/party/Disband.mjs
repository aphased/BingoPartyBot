import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["disband"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Disband Command", // Description of the command
    permission: Permissions.Owner, // Permission level required to execute this command
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        // Code here
        bot.bot.chat("/pc This party will be disbanded in 10 seconds! Command ran by: " + sender);
        setTimeout(() => {
            bot.bot.chat("/p disband");
            bot.webhook.send(
                {
                    username: bot.config.webhook.name,
                },
                {
                    content: `Disbanded party. Command executed by ${sender}`,
                }
            );
        }, 10000)
    }
  }
  