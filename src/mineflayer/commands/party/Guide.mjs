import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["guide", "gd", "g"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Guide Command", // Description of the command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // TODO: add back `publicguide` functionality (sending link upon /pc !guide)

    // TODO: (before the above) bring back the 30 second cooldown in between
    // guide links sent out
    let guide = bot.utils.getMonthGuide();
    console.log(new Date().getMonth() + "/" + new Date().getFullYear());
    console.log(guide);
    if (!guide) {
      bot.utils.setMonthGuide({ link: bot.config.guideLink });
      guide = {
        link: bot.config.guideLink,
      };
    }
    bot.chat(`/pc ${guide.link}`);
  },
};
