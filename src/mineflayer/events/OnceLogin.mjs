import { Collection } from "discord.js";
import Utils from "../../utils/Utils.mjs";
import Webhook from "../../utils/Webhook.mjs";
import { Permissions } from "../../utils/Interfaces.mjs";

export default {
  name: "Login Event",
  description: "The message event stuff",
  /**
   *
   * @param {import("../Bot.mjs").default} bot
   */
  execute: async function (bot) {
    bot.username = bot.bot.username;
    bot.utils.log("Logged in! `(" + bot.username + ")`", "Info");
    if (!bot.utils.playerNamesDatabase.get("data")) {
      bot.utils.log(
        "Player names database is empty! Generating default data...",
        "Warn",
      );
      bot.utils.playerNamesDatabase.set("data", []);
      bot.utils.addUser({
              name: bot.username,
              uuid: await bot.utils.getUUID(bot.username),
          permissionRank: Permissions.BotAccount,
      });
      bot.utils.addUser({
              name: "YOUR USERNAME",
              uuid: "YOUR UUID",
          permissionRank: Permissions.Owner,
      });
      setTimeout(() => {
        bot.utils.log("Added Bot account to database", "Info");
        bot.utils.log(
          "Please turn off bot and add your own account to the database",
          "Error",
        );
        process.exit(1);
      }, 1000);
    }
    const permissionRank = bot.utils.getPermissionsByUser({
      name: bot.username,
    });
    if (!permissionRank) {
      bot.utils.addUser({
              name: bot.username,
              uuid: await bot.utils.getUUID(bot.username),
        permissionRank: Permissions.BotAccount,
      });
      bot.utils.log("Bot account added to database", "Info");
    } else if (permissionRank < Permissions.BotAccount) {
      bot.utils.setPermissionRank({
        name: bot.username,
        permissionRank: Permissions.BotAccount,
      });
      bot.utils.log("Bot account permission updated", "Info");
    }
    bot.webhook = new Webhook(bot.config.webhook.url);
    bot.webhook.send(
      {
        username: bot.config.webhook.name,
      },
      {
        content: "Logged in! `(" + bot.username + ")`",
      },
    );
  },
};
