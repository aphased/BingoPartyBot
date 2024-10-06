import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["test", "testpermissions", "testperms", "testcommand", "boopme"],
  ignore: false,
  description:
    "Test command. See if you are on the permission list, and what permissions you have",
  // One day this will also have ban info? maybe?
  permission: Permissions.ExSplasher,
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // previous implementation:
    /* let userPerms = bot.utils.getPermissionsByUser({ name: sender.username });
    if (userPerms) {
      bot.reply(sender, `You have permission level: ${userPerms}`);
    } */

    let uuid = await bot.utils.getUUID(sender.username);
    if (!uuid) return bot.reply(sender, "whad.");
    let playerNames = bot.utils.playerNamesDatabase.get("data");
    let index = playerNames.findIndex((x) =>
      x.accounts.find((y) => y.uuid === uuid),
    );
    if (index === -1)
      return bot.reply(
        sender,
        "wait how do you manage to run this and get the no perms output what",
      );
    let userObj = playerNames[index];
    let rank = Object.keys(Permissions).find(
      (x) => Permissions[x] === userObj.permissionRank,
    );
    bot.reply(
      sender,
      `You have permissions! Your permission level is ${rank} (Level: ${userObj.permissionRank})`,
    );
  },
};
