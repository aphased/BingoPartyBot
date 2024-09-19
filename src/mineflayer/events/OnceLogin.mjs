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
    bot.utils.log("Logged in! `(" + bot.username + ")`", "Info");
    if (Object.keys(bot.utils.playerNamesDatabase.JSON()).length <= 0) {
      bot.utils.log("Player names database is empty! Fetching data...", "Warn");
      bot.utils.playerNamesDatabase.set("data", [
        {
          accounts: [
            {
              name: bot.username,
              uuid: await bot.utils.getUUID(bot.username),
            },
          ],
          permissionRank: Permissions.BotAccount,
        },
        {
          accounts: [
            {
              name: "YOUR USERNAME",
              uuid: "YOUR UUID",
            },
          ],
          permissionRank: Permissions.Owner,
        },
      ]);
      //   bot.playerNamesDatabase.sync();
      setTimeout(() => {
        bot.utils.log("Added Bot account to database", "Info");
        bot.utils.log(
          "Please turn off bot and add your account to the database",
          "Error",
        );
        process.exit(1);
      }, 1000);
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
