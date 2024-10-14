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
      if(player == bot.username) {
        const messages = [
          sender.username + " tried to kick " + bot.username + " from the party. L Bozo!",
          "I guess " + sender.username + " really doesn't like me. Joke's on you, I don't like you either!",
          "Come on " + sender.username + ", why would you try to do that? :(",
          "Can't kick me if I kick you first, " + sender.username,
        ];
        var random = Math.floor(Math.random()*messages.length);
        bot.chat(`/pc ${messages[random]}`);
        await bot.utils.waitForDelay(bot.utils.minMsgDelay);
        bot.chat(`/p kick ${sender.username}`)
        return;
      }
      if (!bot.utils.isHigherRanked(sender.username, player)) {
        return bot.reply(sender, "You do not have permission to do kick this player!");
      }
      // actual stuff
        bot.chat(`/pc ${player} was kicked from the by ${sender.username}.`);

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
