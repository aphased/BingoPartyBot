import { Permissions } from "../../../utils/Interfaces.mjs";
import Utils from "../../../utils/Utils.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

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
      return bot.reply(
        sender,
        "Please provide a user to query/get permissions for.",
      );
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
    const name = userObj.accounts.find((acc) => acc.name.toLowerCase() === user.toLowerCase()).name;
    bot.reply(
      sender,
      `User: ${name} Rank: ${rank} (Level: ${userObj.permissionRank})`,
    );
  },
};
