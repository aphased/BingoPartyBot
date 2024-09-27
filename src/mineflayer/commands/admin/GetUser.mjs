import { Permissions } from "../../../utils/Interfaces.mjs";
import Utils from "../../../utils/Utils.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["getuser", "query"],
  ignore: false,
  description:
    "See if a user is on the permission list, and what permissions they have",
  //One day this will also have ban info? maybe?
  permission: Permissions.Owner,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let user = args[0];
    let uuid = await bot.utils.getUUID(user);
    if (!uuid) return bot.reply(sender.username, "User not found!");
    let playerNames = bot.utils.playerNamesDatabase.get("data");
    let index = playerNames.findIndex((x) =>
      x.accounts.find((y) => y.uuid === uuid)
    );
    if (index === -1) return bot.reply(sender.username, "User does not exist!");
    let userObj = playerNames[index];
    let rank = Object.keys(Permissions).find(
      (x) => Permissions[x] === userObj.permissionRank
    );
    bot.reply(
      sender,
      `User: ${user} Rank: ${rank} (Level: ${userObj.permissionRank})`
    );
  },
};
