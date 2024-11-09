import { Permissions } from "../../../utils/Interfaces.mjs";
import Utils from "../../../utils/Utils.mjs";

export default {
  name: ["adduser", "user"],
  ignore: false,
  description: "Adds users to the permission list or changes their permission",
  permission: Permissions.Staff,
  // Eventually a sudo command
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {Object} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args.length < 2)
      return bot.reply(
        sender,
        "Usage: !p adduser <user> <(updated)permission> or !p adduser <newAlt> <existingMain>",
      );
    const user = args[0];
    // get correct username capitalisation from uuid request response
    const data = await bot.utils.getUUID(user, true);
    if (!data)
      return bot.reply(
        sender,
        `Something went wrong while fetching ${user}'s UUID! Invalid username or Mojang API issue`,
      );
    if (bot.utils.getUserObject({ name: args[1] })) {
      // add alt account to existing player entry ("!p adduser <altName> <mainName>")
      if (bot.utils.getUserObject({ name: user }))
        return bot.reply(sender, `${data.name} is already in the database!`);
      const mainUser = args[1];
      if (!bot.utils.isHigherRanked(sender.username, mainUser))
        return bot.reply(
          sender,
          `Your permission rank is too low to perform this operation.`,
        );
      bot.utils.addUser({
        name: data.name,
        uuid: data.uuid,
        mainAccount: mainUser,
      });
      bot.reply(sender, `Added ${data.name} as ${mainUser}'s alt.`);
    } else {
      // Add entirely new player entry or update `permissionRank`
      let permissionRank;
      if (isNaN(args[1]))
        permissionRank =
          Permissions[
            Object.keys(Permissions).find(
              (key) => key.toLowerCase() === args[1].toLowerCase(),
            )
          ];
      else permissionRank = parseInt(args[1]);
      // Check if permission is valid
      if (!Object.values(Permissions).includes(permissionRank))
        return bot.reply(sender, `Invalid permission rank: ${args[1]}.`);
      if (
        permissionRank >=
        bot.utils.getPermissionsByUser({ name: sender.username })
      )
        return bot.reply(
          sender,
          `Your permission rank is too low to perform this operation.`,
        );
      if (bot.utils.getUserObject({ name: data.name })) {
        // Update permission rank if user exists
        bot.utils.setPermissionRank({
          name: data.name,
          permissionRank: permissionRank,
        });
        const permission = Object.keys(Permissions).find(
          (perm) => Permissions[perm] === permissionRank,
        );
        return bot.reply(
          sender,
          `Updated ${data.name}'s permission to ${permission} (level: ${permissionRank})`,
        );
      }
      bot.utils.addUser({
        name: data.name,
        uuid: data.uuid,
        permissionRank: permissionRank,
      });
      const permission = Object.keys(Permissions).find(
        (perm) => Permissions[perm] === permissionRank,
      );
      return bot.reply(
        sender,
        `Added ${data.name} as new account with permission ${permission} (level: ${permissionRank})`,
      );
    }
  },
};
