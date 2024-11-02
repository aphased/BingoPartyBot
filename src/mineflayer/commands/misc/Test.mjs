import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["test", "testpermissions", "testperms", "testcommand", "boopme"],
  ignore: false,
  description:
    "Test command. See if you are on the permission list, and what permissions you have",
  // command can't have a permission requirement, otherwise any uuid fetching here is pointless as db permission checks would prevent it from executing in the first place
  // there still isn't any output without being in the db

  // One day this will also have ban info? maybe?
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let uuid = await bot.utils.getUUID(sender.username);
    let permissionRank;
    if (uuid) permissionRank = bot.utils.getPermissionsByUser({ uuid: uuid });
    // if uuid fetching fails, try with username
    else
      permissionRank = bot.utils.getPermissionsByUser({
        name: sender.username,
      });
    if (permissionRank < 0)
      return;
    const permission = Object.keys(Permissions).find(
      (perm) => Permissions[perm] === permissionRank,
    );
    bot.reply(
      sender,
      `You have permissions! Your permissions are ${permission} (Level: ${permissionRank})`,
    );
  },
};
