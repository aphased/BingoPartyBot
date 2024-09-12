import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["help"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Help Command", // Description of the command
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        bot.bot.chat(`/w ${sender} Read the documentation at: https://github.com/aphased/BingoPartyCommands/`);
    }
  }
  