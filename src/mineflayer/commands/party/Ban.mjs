import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["ban", "block"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Ban Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute this command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let player = args[0];
    if (!player)
      return bot.reply(sender.username, "Please provide a player to ban.");
    let reason = args.slice(1).join(" ") || "No reason given.";
    bot.chat(
      `/pc ${player} was removed from the party and blocked from rejoining by ${sender.username}.`,
    );
    setTimeout(() => {
      bot.chat(`/lobby`);
      setTimeout(() => {
        bot.chat(`/p kick ${player}`);
        setTimeout(() => {
          bot.chat(`/block add ${player}`);
          setTimeout(() => {
            bot.chat(`/limbo`);
            bot.webhook.send(
              {
                username: bot.config.webhook.name,
              },
              {
                content: `\`${player}\` was banned from the party by \`${sender.username}\`. Reason: \`${reason}\``,
              },
            );
          }, 550);
        }, 550);
      }, 550);
    }, 550);
  },
};
