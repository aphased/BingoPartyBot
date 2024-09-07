import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["poll"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Poll Command", // Description of the command
    permission: Permissions.Trusted, // Permission level required to execute
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        let poll = args.join(" ");
        bot.bot.chat(`/p poll ${sender}: ${poll}`)
    }
  }
  