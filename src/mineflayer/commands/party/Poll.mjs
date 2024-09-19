import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["poll"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Poll Command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let poll = args.join(" ");
    // TODO: add checks on poll validity, and `bot.reply()` with the reason if
    // it fails those. See pre-rewrite handling of this for reference below:

    // // Some basic checks on poll message validity. If a message contains less
    // // than exactly 2 or more than 5 slashes ("/"), Hypixel is likely going to
    // // reject it (minimum two poll options, max. 5), thus:
    // let slashCharCount = 0;
    // for (let i = 0; i < pollMessage.length; i++) {
    //   if (pollMessage[i] === "/") {
    //     slashCharCount++;
    //   }
    // }
    // logDebug("Party poll slashCharCount: '" + slashCharCount + "'");

    // // Another check – Hypixel: "Each answer can only be 20 characters long."
    // // (questions part can be longer, so we shift() the array once to discard it from this test)
    // let portions = pollMessage.split("/");
    // portions.shift();
    // let answerLengthsValid = portions.every((portion) => {
    //   return portion.length <= 20;
    // });

    // // TODO: this is the boolean to update in case of adding new checks on
    // // poll message validity, if it is to be made more sophisticated:
    // const isValidPoll =
    //   slashCharCount >= 2 && slashCharCount <= 5 && answerLengthsValid;

    // if (!isValidPoll) {
    //   outputCommand(
    //     `r Hi ${rankRemovedSenderName}, what you sent wasn't a valid poll!`,
    //   );
    // } else {
    //   outputCommand(`p poll From ${formattedSenderName}: ${pollMessage}`);
    // }

    bot.chat(`/p poll ${sender}: ${poll}`);
  },
};
