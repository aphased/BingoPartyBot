import { Permissions, WebhookMessageType } from "../../utils/Interfaces.mjs";

export default {
  name: "Login Event",
  description: "The message event stuff",
  /**
   *
   * @param {import("../Bot.mjs").default} bot
   */
  execute: async function (bot) {
    bot.setUsername(bot.bot.username);
    bot.utils.log("Logged in! `(" + bot.getUsername() + ")`", "Info");
    if (!bot.utils.playerNamesDatabase.get("data")) {
      bot.utils.log(
        "Player names database is empty! Generating default data...",
        "Warn",
      );
      bot.utils.playerNamesDatabase.set("data", []);
      bot.utils.addUser({
        name: bot.getUsername(),
        uuid: await bot.utils.getUUID(bot.getUsername()),
        permissionRank: Permissions.BotAccount,
      });
      bot.utils.addUser({
        name: "YOUR USERNAME",
        uuid: "YOUR UUID",
        permissionRank: Permissions.Owner,
      });
      bot.utils.log("Added Bot account to database", "Info");
      bot.utils.log(
        "Please turn off bot and add your own account to the database",
        "Error",
      );
      await bot.utils.delay(1000);
      process.exit(1);
    }
    const permissionRank = bot.utils.getPermissionsByUser({
      name: bot.getUsername(),
    });
    if (permissionRank < 0) {
      bot.utils.addUser({
        name: bot.getUsername(),
        uuid: await bot.utils.getUUID(bot.getUsername()),
        permissionRank: Permissions.BotAccount,
      });
      bot.utils.log("Bot account added to database", "Info");
    } else if (permissionRank < Permissions.BotAccount) {
      bot.utils.setPermissionRank({
        name: bot.getUsername(),
        permissionRank: Permissions.BotAccount,
      });
      bot.utils.log("Bot account permission updated", "Info");
    }
    bot.utils.webhookLogger.addMessage(
      `Logged in! \`(${bot.getUsername()})\``,
      WebhookMessageType.ActionLog,
      true,
    );
    // schedule first refresh of usernames from UUID
    if (!bot.config.debug.disableUsernameRefresh) {
      const lastRefresh = bot.utils.generalDatabase.get("lastUsernameRefresh");
      let scheduleTime =
        bot.config.usernameRefreshInterval - (Date.now() - (lastRefresh ?? 0));
      // delay the refresh for 1min if it has been due/is due soon to avoid overloading the bot on startup
      if (scheduleTime < 60_000) scheduleTime = 60_000;
      // save timeout ID to be able to reschedule the refresh when updating manually (!p updatenames)
      bot.utils.scheduledUsernameRefresh = setTimeout(
        bot.utils.updateAllFromUUID.bind(bot.utils),
        scheduleTime,
        bot,
      );
    }
  },
};
