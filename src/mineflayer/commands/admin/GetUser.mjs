import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["getuser", "query"],
  ignore: false,
  description:
    "See if a user is on the permission list, and what permissions they have",
  // TODO: One day this will also have ban info? maybe?
  permission: Permissions.Trusted,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let user = args[0];
    if (!user) {
      return bot.reply(sender, "Usage: !p query <username> [alts]");
    }
    let userObj = bot.utils.getUserObject({ name: user });
    if (!userObj)
      return bot.reply(
        sender,
        "That person does not have any party permissions.",
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
      alts.length < 1
        ? "No alts for this user."
        : `Alts: ${alts.join(", ")}`;
    bot.reply(
      sender,
      `User: ${username} Rank: ${rank} (Level: ${userObj.permissionRank}) ${altlist}`,
    );
  },
};
