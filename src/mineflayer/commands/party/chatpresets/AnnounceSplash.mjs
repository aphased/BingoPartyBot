import { Permissions, VerbosityLevel } from "../../../../utils/Interfaces.mjs";

export default {
  name: ["splash", "hub", "announcesplash", "announce"],
  description: "Announce a splash in party chat",
  usage:
    "!p splash <hub number> [hub id] | !p splash /p join <username> | !p splash switch <new hub>",
  permission: Permissions.Trusted,

  /**
   *
   * @param {import("../../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let message;
    let dontRepeat = false;

    // first arg (hub number)
    if (args[0] && !isNaN(args[0])) {
      const hubNumber = parseInt(args[0]);
      if (hubNumber < 1 || hubNumber > 28)
        return bot.reply(sender, "Invalid hub number!", VerbosityLevel.Reduced);

      // check for and extract hub ID
      const match = args[1]?.match(
        /^\(?(mega|mini|M|m)(\d{1,4}[A-Za-z]{1,2})\)?$/,
      );
      let hubID;
      // convert `M`/`m` to `mega`/`mini`
      if (match?.[1] === "M") hubID = "mega" + match[2].toUpperCase();
      else if (match?.[1] === "m") hubID = "mini" + match[2].toUpperCase();
      else if (match) hubID = match[1] + match[2].toUpperCase();

      message = `${sender.preferredName} is splashing in Hub ${hubNumber}${hubID ? ` (${hubID})` : ""} soon!`;
    } else if (/^\/p join \w{3,16}/.test(args.join(" "))) {
      // validate username for /p join
      let pjoinUsername = await bot.utils.usernameExists(args[2]);
      if (pjoinUsername === false)
        return bot.reply(sender, "Username not found.", VerbosityLevel.Reduced);

      message = `${sender.preferredName} is splashing soon! Run '/p join ${pjoinUsername}' to get warped!`;
    } else if (args[0] === "switch" && !isNaN(args[1])) {
      // announce hub has shifted
      const hubNumber = parseInt(args[1]);
      if (hubNumber < 1 || hubNumber > 28)
        return bot.reply(sender, "Invalid hub number!", VerbosityLevel.Reduced);
      dontRepeat = true;
      message = `The hub number changed to ${hubNumber}! Make sure to check the hub ID!`;
    } else
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );

    if (dontRepeat)
      bot.utils
        .getCommandByAlias(bot, "say")
        .execute(bot, sender, message.split(" "), {
          callerCommand: this,
          includePrefix: false,
        });
    else
      bot.utils
        .getCommandByAlias(bot, "flea")
        .execute(bot, sender, message.split(" "), {
          callerCommand: this,
          includePrefix: false,
        });
  },
};
