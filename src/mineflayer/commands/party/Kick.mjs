import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["kick", "remove"], // This command will be triggered by either command1 or command2
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
      let player = args[0];
      let reason = args.slice(1).join(" ") || "No reason given.";
      // check for invalid usage: no player or trying to kick player with higher or same perms
      if (!player) return bot.reply(sender, "Please provide a player to kick.");

      if (!bot.utils.isHigherRanked(sender.username, player)) {
        return bot.reply(sender, "You do not have permission to do kick this player!");
      }
      // actual stuff
        bot.chat(`/pc ${player} was removed from the party and blocked from rejoining by ${sender.username}.`);

        await bot.utils.waitForDelay(bot.utils.minMsgDelay);
        bot.chat(`/p kick ${player}`);

        bot.webhook.send(
          {
            username: bot.config.webhook.name,
          },
          {
            content: `\`${player}\` was kicked from the party by \`${sender.username}\`. Reason: \`${reason}\``,
          },
        );
},
};
