import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["disable"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Test command", // Description of the command
    permission: Permissions.Admin, // Permission level required to execute this command
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {Object} sender 
     * @param {String} [sender.username] - Username of the sender
     * @param {String} [sender.preferredName] - Preferred name of the sender
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        // Code here
        if(args[0] && args[0].toLowerCase() === "all") {
            bot.partyCommands.forEach((value, key) => {
                if(key.includes("disable") || key.includes("enable")) return;
                bot.partyCommands.get(key).disabled = true;
            })
            bot.bot.chat("/r All commands disabled");
        } else {
            if(!args[0]) return bot.bot.chat("/r Please specify a command to disable");
            let command = bot.partyCommands.find((value, key) => key.includes(args[0]));
            if(!command) return bot.bot.chat("/r Command not found");
            command.disabled = true;
            bot.bot.chat("/r Command disabled");
        }
    }
  }
  