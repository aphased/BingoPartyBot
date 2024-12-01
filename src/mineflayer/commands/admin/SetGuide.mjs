import {
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["setguide"],
  description:
    "Sets/overwrites the current or a specific month's bingo guide link",
  usage: "!p setguide <link> [MM/YYYY]",
  permission: Permissions.Admin,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (!args[0] || (args[1] && !/^\d{2}\/\d{4}$/.test(args[1])))
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    if (!/^https:\/\/hypixel\.net\/threads\/bingo/.test(args[0]))
      return bot.reply(
        sender,
        "Invalid guide link! Link must adhere to the following format: 'https://hypixel.net/threads/bingo...'",
        VerbosityLevel.Reduced,
      );
    bot.utils.setMonthGuide({
      link: args[0],
      overwrite: true,
      time: args[1],
    });
    bot.reply(sender, "Guide link has been set.", VerbosityLevel.Reduced);
    bot.utils.webhookLogger.addMessage(
      `The guide link for ${args[1] ? `\`${args[1]}\`` : "this month"} has been set to \`${args[0]}\` by \`${sender.preferredName}\`.`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
