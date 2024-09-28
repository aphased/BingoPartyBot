import { Permissions } from "../../../utils/Interfaces.mjs";
import Utils from "../../../utils/Utils.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["adduser"],
  ignore: false,
  description: "Adds users to the permission list",
  permission: Permissions.Owner,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let user = args[0];
    let rank = args[1];
    let mainUser = args[2];
    console.log(user, rank, mainUser);
    rank = Utils.capitalizeFirstLetter(rank);
    let uuid = await bot.utils.getUUID(user);
    let mainUserUUID = await bot.utils.getUUID(mainUser);
    if (!uuid || (mainUser && !mainUserUUID))
      return bot.reply(sender.username, "User not found!");
    let playerNames = bot.utils.playerNamesDatabase.get("data");
    if (playerNames.find(x => x.accounts.find(y => y.uuid === uuid)))
      return bot.reply(sender.username, "User already exists!");
    let rankNum = Permissions[rank];
    if (!rankNum) return bot.reply(sender.username, "Invalid rank!");
    if (mainUser) {
      let users = playerNames.find(x =>
        x.accounts.find(y => y.uuid === mainUserUUID)
      );
      users.accounts.push({ name: user, uuid: uuid });
      playerNames[playerNames.indexOf(users)] = users;
    } else {
      playerNames.push({
        accounts: [
          {
            name: user,
            uuid: uuid,
          },
        ],
        permissionRank: rankNum,
      });
    }
    bot.utils.playerNamesDatabase.set("data", playerNames);
    bot.reply(sender.username, `Added user ${user} with rank ${rank}`);
  },
};
