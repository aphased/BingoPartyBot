import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["stream", "public", "open"], // This command will be triggered by either command1 or command2
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
        let amt = parseInt(args[0]) || 100;
        bot.reply(`/pc Party size was set to ${amt} by ${sender}`);
        setTimeout(() => {
            bot.reply("/stream open " + amt);
            bot.webhook.send(
                {
                    username: bot.config.webhook.name,
                },
                {
                    content: `Party was set to public (${amt}). Command executed by ${sender}`,
                }
            );
        }, 1000)
    }
  }
  