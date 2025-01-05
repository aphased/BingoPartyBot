import {
  DisableCommand,
  Permissions,
  VerbosityLevel,
  WebhookMessageType,
} from "../../../utils/Interfaces.mjs";

export default {
  name: ["adduser", "user"],
  description:
    "Add users to the permission list or change their permission level",
  usage:
    "!p adduser <user> <(updated)permission> | !p adduser <new alt> <existing main>",
  permission: Permissions.Staff,
  disableCommand: DisableCommand.UsuallyKeepEnabled,

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
        `Invalid usage! Use: ${this.usage}`,
        VerbosityLevel.Reduced,
      );
    const user = args[0];
    // get correct username capitalisation from uuid request response
    const data = await bot.utils.getUUID(user, true);
    if (!data)
      return bot.reply(
        sender,
        `Something went wrong while fetching ${user}'s UUID! Invalid username or Mojang API issue`,
        VerbosityLevel.Reduced,
      );
    if (bot.utils.getUserObject({ name: args[1] })) {
      // add alt account to existing player entry ("!p adduser <altName> <mainName>")
      if (bot.utils.getUserObject({ name: user }))
        return bot.reply(
          sender,
          `${data.name} is already in the database!`,
          VerbosityLevel.Reduced,
        );
      const mainUser = args[1];
      if (!bot.utils.isHigherRanked(sender.username, mainUser))
        return bot.reply(
          sender,
          `Your permission rank is too low to perform this operation.`,
          VerbosityLevel.Reduced,
        );
      bot.utils.addUser({
        name: data.name,
        uuid: data.uuid,
        mainAccount: mainUser,
      });
      bot.utils.webhookLogger.addMessage(
        `\`${data.name}\` was added to the database as \`${mainUser}\`'s alt account by \`${sender.username}\`.`,
        WebhookMessageType.ActionLog,
        true,
      );
      bot.reply(
        sender,
        `Added ${data.name} as ${mainUser}'s alt.`,
        VerbosityLevel.Reduced,
      );
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
        return bot.reply(
          sender,
          `Invalid permission rank: ${args[1]}.`,
          VerbosityLevel.Reduced,
        );
      if (
        permissionRank >=
        bot.utils.getPermissionsByUser({ name: sender.username })
      )
        return bot.reply(
          sender,
          `Your permission rank is too low to perform this operation.`,
          VerbosityLevel.Reduced,
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
        bot.utils.webhookLogger.addMessage(
          `\`${data.name}\`'s permission rank was updated to \`${permission}\` (level: \`${permissionRank}\`) by \`${sender.username}\`.`,
          WebhookMessageType.ActionLog,
          true,
        );
        return bot.reply(
          sender,
          `Updated ${data.name}'s permission to ${permission} (level: ${permissionRank})`,
          VerbosityLevel.Reduced,
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
      bot.utils.webhookLogger.addMessage(
        `\`${data.name}\` was added to the database with permission rank \`${permission}\` (level: \`${permissionRank}\`) by \`${sender.username}\`.`,
        WebhookMessageType.ActionLog,
        true,
      );
      return bot.reply(
        sender,
        `Added ${data.name} as new account with permission ${permission} (level: ${permissionRank})`,
        VerbosityLevel.Reduced,
      );
    }
  },
};
