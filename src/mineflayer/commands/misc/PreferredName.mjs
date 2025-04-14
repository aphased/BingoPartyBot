import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["preferredname", "pn", "name"],
  description:
    'Mark one of your accounts as the main, "preferred" username. This will be the name used by the bot in certain commands.',
  usage: "!p preferredname [alt username]",
  permission: Permissions.Splasher,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let availableAccs = bot.utils.getUserObject({
      name: sender.username,
    })?.accounts;
    if (!availableAccs)
      return bot.reply(
        sender,
        "How are you even able to run this without being in the db??",
        VerbosityLevel.Reduced,
      );
    // get account object with supplied username (case-insensitive)
    const account = availableAccs.find(
      (obj) => obj.name.toLowerCase() === args[0]?.toLowerCase?.(),
    );

    // no name supplied or not a valid option
    if (!account) {
      const message = `Your current preferred name is: ${sender.preferredName}. Set it to any one of your ${availableAccs.length} accounts' igns: ${availableAccs.map((obj) => obj.name).join(", ")}`;
      if (message.length > 252) {
        const splitIndex = message.slice(0, 253).lastIndexOf(" ");
        bot.reply(sender, message.slice(0, splitIndex), VerbosityLevel.Minimal);
        await bot.utils.delay(bot.utils.minMsgDelay);
        bot.reply(sender, message.slice(splitIndex), VerbosityLevel.Minimal);
        return;
      }
      return bot.reply(sender, message, VerbosityLevel.Minimal);
    }
    bot.utils.setPreferredAccount({
      name: sender.username,
      preferredAccount: account.uuid,
    });
    bot.reply(
      sender,
      `Your preferred name has been set to ${account.name}.`,
      VerbosityLevel.Reduced,
    );
  },
};
