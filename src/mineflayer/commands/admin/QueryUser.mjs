import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["query", "getuser", "queryuser"],
  description:
    "See whether a user is on the permission list, and what permissions they have",
  usage: "!p query <username>",
  permission: Permissions.Trusted,
  // TODO: One day this will also have ban info? maybe?

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let user = args[0];
    if (!user) {
      return bot.reply(
        sender,
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    }
    let userObj = bot.utils.getUserObject({ name: user });
    if (!userObj)
      return bot.reply(
        sender,
        "That person does not have any party permissions.",
        VerbosityLevel.Minimal,
      );
    const rank = Object.keys(Permissions).find(
      (perm) => Permissions[perm] === userObj.permissionRank,
    );
    // Get name with correct capitalisation
    const username = userObj.accounts.find(
      (acc) => acc.name.toLowerCase() === user.toLowerCase(),
    ).name;
    // Get user's other accounts
    const alts = userObj.accounts
      .map((acc) => acc.name)
      .filter((name) => name !== username);
    const altlist =
      alts.length < 1 ? "No alts for this user." : `Alts: ${alts.join(", ")}`;
    bot.reply(
      sender,
      `User: ${username} Rank: ${rank} (Level: ${userObj.permissionRank}) ${altlist}`,
      VerbosityLevel.Minimal,
    );
  },
};
