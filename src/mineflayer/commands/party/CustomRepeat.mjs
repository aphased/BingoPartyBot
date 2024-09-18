import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["customrep", "customrepeat", "crep", "crepeat"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Repeat Command", // Description of the command
    permission: Permissions.Trusted, // Permission level required to execute
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        let repetitions = parseInt(args[0]);
        if(isNaN(repetitions)) repetitions = 5;
        if(repetitions > 7) repetitions = 7;
        let duration = parseInt(args[1]);
        if(isNaN(duration)) duration = 2;
        for(let i = 0; i <= repetitions; i++) {
            setTimeout(() => {
                bot.reply(`/pc ${sender}: ${args.slice(2).join(" ")}`);
            }, duration);
        }
    }
  }
  