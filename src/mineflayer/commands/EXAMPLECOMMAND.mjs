import { Permissions } from "../../utils/Interfaces.mjs";

export default {
  name: ["command1", "command2"], // This command will be triggered by either command1 or command2
  ignore: true, // Whether to ignore this file or not
  description: "Test command", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command
  customPrefix: "", // Only use this if you want to use a custom prefix for this command, otherwise leave it empty and it'll use the default prefix
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // Code here…
    /* Some remarks:
       - If you have some sort of status update or confirmation to give back to
         the sender, use bot.reply(sender, msg)
       - Sending links (https://…) that aren't found on the hypixel.net domain won't work,
         unfortunately, due to Hypixel's limitations on "advertising"
    */
    /*
       Read CONTRIBUTING.md for more things that are good to know =)
    */
  },
};
