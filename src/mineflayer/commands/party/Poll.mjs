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

    // Some basic checks on poll message validity. If a message contains less
    // than exactly 2 or more than 5 slashes ("/"), Hypixel is likely going to
    // reject it (minimum two poll options, max. 5), thus:
    let slashCharCount = 0;
    for (let i = 0; i < poll.length; i++) {
      if (poll[i] === "/") {
        slashCharCount++;
      }
    }

    // Another check – Hypixel: "Each answer can only be 20 characters long."
    // (questions part can be longer, so we shift() the array once to
    // discard it from this test)
    let portions = poll.split("/");
    portions.shift();
    let answerLengthsValid = portions.every((portion) => {
      return portion.length <= 20;
    });

    // TODO: this is the boolean to update in case of adding new checks on poll
    // message validity, if it is to be made more sophisticated (e.g. maximum
    // overall poll message length when sending from Discord in the future?):
    const isValidPoll =
      slashCharCount >= 2 && slashCharCount <= 5 && answerLengthsValid;

    if (!isValidPoll) {
      bot.reply(
        sender,
        `Hi ${sender.username}, what you sent wasn't a valid poll!`,
      );
      setTimeout(() => {
        bot.reply(sender, "The correct format for a poll is:");

        setTimeout(() => {
          bot.reply(
            sender,
            "Question?/Answer1/Answer2/Optional/Optional/Optional",
          );
        }, bot.utils.minMsgDelay);
      }, bot.utils.minMsgDelay);
    } else {
      bot.chat(`/p poll ${sender.username}: ${poll}`);
    }
  },
};
