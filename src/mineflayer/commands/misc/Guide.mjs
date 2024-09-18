import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["guide", "gd", "g"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Guide Command", // Description of the command
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        let time = new Date().getMonth() + "/" + new Date().getFullYear();
        const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
        if(args[0] && regex.test(args[0])) time = args[0];
        bot.reply(`/w ${sender} Here: ${bot.utils.getMonthGuide({ time })}`);
    }
  }
  