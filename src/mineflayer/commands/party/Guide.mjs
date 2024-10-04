import { Permissions } from "../../../utils/Interfaces.mjs";

/** Timestamp of the last guide message sent */
let lastGuideSentTime = 0;
const COOLDOWN_DURATION = 30 * 1000;

export default {
  name: ["guide", "gd", "g", "publicguide"], // This command will be triggered by either command1 or command2
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
    const currentTime = Date.now();

    if (currentTime - lastGuideSentTime < COOLDOWN_DURATION) {
      // const timeLeft = Math.ceil(
      //   (COOLDOWN_DURATION - (currentTime - lastGuideSentTime)) / 1000,
      // );
      // TODO: optional Discord logging for this when requested via a future
      // Discord "slash" command
      //   `Please wait ${timeLeft} seconds before requesting the guide again.`
      bot.utils.log(
        "Not posting guide again. (<30s passed since last share message)",
        "Info",
      );
      return;
    }

    lastGuideSentTime = currentTime;

    // TODO: add back `publicguide` functionality (sending link upon reading
    // /pc !guide from a player and do not send the below `bot.reply()` in that
    // case. Update the boolean accordingly with some dynamic condition.
    const publicGuideRequest = false;

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

      // Don't give the below instructions reply in case of a
      // "Party > Someone: !guide" requesting the link
      if (!publicGuideRequest) {
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
      }

      return;
    }

    bot.chat(`/pc Guide: ${guide.link}`);
  },
};
