import { Permissions, VerbosityLevel } from "../../../utils/Interfaces.mjs";

export default {
  name: ["updatenames", "refreshnames"],
  description: "Manually trigger a database username refresh from UUIDs",
  usage: "!p updatenames [confirm]",
  permission: Permissions.Owner,

  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    if (args[0] !== "confirm") {
      let sinceLast = Math.round(
        (Date.now() -
          (bot.utils.generalDatabase.get("lastUsernameRefresh") ?? 0)) /
          60_000,
      );
      let toNext =
        Math.round(bot.config.usernameRefreshInterval / 60_000) - sinceLast;
      if (toNext < 0) toNext = "<1";
      return bot.reply(
        sender,
        `The last refresh happened ${sinceLast} minute(s) ago. The next one will happen in ${toNext} minute(s). If you want to manually trigger one, run '!p updatenames confirm'.`,
        VerbosityLevel.Reduced,
      );
    }
    bot.reply(sender, "Started username refresh!", VerbosityLevel.Reduced);
    // cancel previously scheduled refresh
    clearTimeout(bot.utils.scheduledUsernameRefresh);
    // initiate manual refresh
    const results = await bot.utils.updateAllFromUUID(bot);
    // schedule next automatic refresh
    bot.utils.scheduledUsernameRefresh = setTimeout(
      bot.utils.updateAllFromUUID.bind(bot.utils),
      bot.config.usernameRefreshInterval,
      bot,
    );
    const intervalInMin = Math.round(
      bot.config.usernameRefreshInterval / 60_000,
    );
    if (results.failed === 0)
      bot.reply(
        sender,
        `Successfully updated all stored username in ${results.timeTaken}s! Next automatic refresh scheduled in ${intervalInMin} minutes.`,
        VerbosityLevel.Reduced,
      );
    else
      bot.reply(
        sender,
        `Failed to update ${results.failed} usernames! Check logs for details. Next automatic refresh scheduled in ${intervalInMin} minutes.`,
        VerbosityLevel.Reduced,
      );
  },
};
