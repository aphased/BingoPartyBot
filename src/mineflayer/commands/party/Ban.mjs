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
      let reason = args.slice(1).join(" ") || "No reason given.";
      // check for invalid usage: no player or trying to ban player with higher or same perms
      if (!player) return bot.reply(sender, "Please provide a player to ban.");
      if(player == bot.username) {
        const messages = [
          sender.username + " tried to ban " + bot.username + " from the party. L Bozo!",
          "I guess " + sender.username + " really doesn't like me. Joke's on you, I don't like you either!",
          "Come on " + sender.username + ", why would you try to do that? :(",
          "Can't ban me if I kick you first, " + sender.username,
        ];
        var random = Math.floor(Math.random()*messages.length);
        bot.chat(`/pc ${messages[random]}`);
        await bot.utils.waitForDelay(bot.utils.minMsgDelay);
        bot.chat(`/p kick ${sender.username}`)
        return;
      }
      if (!bot.utils.isHigherRanked(sender.username, player)) {
        return bot.reply(sender, "You do not have permission to do ban this player!");
      }
      // actual stuff
        bot.chat(`/pc ${player} was removed from the party and blocked from rejoining by ${sender.username}.`);

        await bot.utils.waitForDelay(bot.utils.minMsgDelay);
        bot.chat(`/lobby`);

        await bot.utils.waitForDelay(bot.utils.minMsgDelay);
        bot.chat(`/p kick ${player}`);

        await bot.utils.waitForDelay(bot.utils.minMsgDelay);
        bot.chat(`/block add ${player}`);

        await bot.utils.waitForDelay(bot.utils.minMsgDelay);
        bot.chat(`/limbo`);

        bot.webhook.send(
          {
            username: bot.config.webhook.name,
          },
          {
            content: `\`${player}\` was banned from joining the party by \`${sender.username}\`. Reason: \`${reason}\``,
          },
        );
},
};
