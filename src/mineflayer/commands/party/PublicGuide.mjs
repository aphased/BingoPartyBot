import { Permissions } from "../../../utils/Interfaces.mjs";

/** Timestamp of the last public guide message sent */
let lastGuideSentTime = 0;
const COOLDOWN_DURATION = 30 * 1000;

export default {
  name: ["!guide", "!gd"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Public Guide Command", // Description of the command
  isPartyChatCommand: true,
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
        "Not posting public guide again. (<30s passed since last share message)",
        "Info",
      );
      return;
    }

    lastGuideSentTime = currentTime;

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
      return;
    }

    bot.chat(`/pc Guide: ${guide.link}`);
  },
};
