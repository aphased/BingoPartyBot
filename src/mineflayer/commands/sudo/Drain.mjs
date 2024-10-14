import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["drain", "empty"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Empties the party after a 10 second delay", // Description of the command
  permission: Permissions.Admin, // Permission level required to execute this command
  // customPrefix: "!sudo", // Only use this if you want to use a custom prefix for this command, otherwise leave it empty and it'll use the default prefix
  /*
  permission: Permissions.Admin
maybe for the per user thing it can be something like:
  permission: Permissions.SudoWhitelisted
so even trusted people can run sudo commands if trusted enough
or maybe even something like
  permission: SudoPermissions.Whitelisted
but for now itll be admin only because this command is very much poisable
*/
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let reason = args.slice(0).join(" ") || "No reason given.";
    bot.chat(
      `/pc The party was emptied by ${sender.username}. 10 seconds remaining until empty!`,
    );
    await bot.utils.waitForDelay(10000);
    bot.chat("/pc The party has been emptied!");

    await bot.utils.waitForDelay(bot.utils.minMsgDelay);
    bot.chat("/streamgui settings empty");

    bot.webhook.send(
      {
        username: bot.config.webhook.name,
      },
      {
        content: `The party was emptied by \`${sender.username}\` Reason: \`${reason}\``,
      },
    );
  },
};

//yes this entire command was a copy paste
