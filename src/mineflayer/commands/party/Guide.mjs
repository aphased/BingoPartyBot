import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["guide", "gd", "g"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Guide Command", // Description of the command
  permission: Permissions.Trusted,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let guide = bot.utils.getMonthGuide();
    console.log(new Date().getMonth() + 1 + "/" + new Date().getFullYear());
    console.log(guide);
    if (!guide || !guide.link) {
      bot.utils.setMonthGuide({ link: bot.config.guideLink });
      guide = {
        link: bot.config.guideLink,
      };
    }

    if (!guide.link) {
      // Prevent _ever_ outputting empty "Party > [MVP++] BingoParty: Guide: "
      console.log("Absolutely no guide available!");

      /* We really only expect to get one relevant entry (corresponding to the
        actual person) with owner permission, so taking the first object from
        the result is ok. After that, we can try again if preferredName isn't
        set (i.e., returns null) by taking the first in-game accounts' name */
      const botAccountOwner =
        bot.utils.getUsersByPermissionRank(Permissions.Owner)?.[0]
          ?.preferredName ??
        bot.utils.getUsersByPermissionRank(Permissions.Owner)?.[0]
          ?.accounts?.[0]?.name ??
        null;

      bot.reply(
        sender,
        // equivalent to e.g. "contact aphased"
        `No guide available - contact ${botAccountOwner}`,
      );

      return;
    }

    bot.chat(`/pc Guide: ${guide.link}`);
  },
};
