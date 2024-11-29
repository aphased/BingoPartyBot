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
    if (!isNaN(args[0])) {
      const hubNumber = parseInt(args[0]);
      if (hubNumber < 1 || hubNumber > 28)
        return bot.reply(sender, "Invalid hub number!", VerbosityLevel.Reduced);
      const match = args[1]?.match(/^(mega|mini|M|m)\d{1,4}[A-Z]{1,2}$/);
      let hubID;
      // convert `M`/`m` to `mega`/`mini`
      if (match?.[1] === "M") hubID = "mega" + match[0].slice(1);
      else if (match?.[1] === "m") hubID = "mini" + match[0].slice(1);
      else hubID = match?.[0];
      message = `${sender.preferredName} is splashing in Hub ${hubNumber}${hubID ? ` (${hubID})` : ""} soon!`;
    } else if (/^\/p join \w{3,16}/.test(args.join(" "))) {
      // validate username for /p join
      const pjoinUsername = (await bot.utils.getUUID(args[2], true))?.name;
      if (!pjoinUsername)
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
        .execute(bot, null, message.split(" "));
    else
      bot.utils
        .getCommandByAlias(bot, "flea")
        .execute(bot, null, message.split(" "));
  },
};
