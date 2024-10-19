import { Permissions } from "../../../utils/Interfaces.mjs";

/** Timestamp of the last guide message sent */
let lastGuideSentTime = 0;
const COOLDOWN_DURATION = 30_000;

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
  execute: async function (bot, sender, args, isPublicCommand = false) {
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
      if (!isPublicCommand) {
        bot.reply(
          sender,
          `Guide command is on cooldown!`,
        );
      }
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
      if (!isPublicCommand) {
        // `Permissions.BotAccount === Permissions.Owner`, so the bot has to be filtered out first
        // Then take the first remaining user, as only one owner is expected
        const botAccountOwner = bot.utils.getPreferredUsername({
          name: bot.utils
            .getUsersByPermissionRank(Permissions.Owner)
            .find(
              (obj) => !obj.accounts.some((acc) => acc.name === bot.username),
            )?.accounts?.[0]?.name,
        });

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
