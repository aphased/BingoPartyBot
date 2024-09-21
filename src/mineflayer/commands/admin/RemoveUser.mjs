import { Permissions } from "../../../utils/Interfaces.mjs";
import Utils from "../../../utils/Utils.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["removeuser"],
  ignore: false,
  description: "Test command",
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
    // TODO: attempt to try it based on username one time if UUID fails?
    if (!uuid) return bot.reply(sender.username, `User ${user} not found!`);
    let playerNames = bot.utils.playerNamesDatabase.get("data");
    let index = playerNames.findIndex((x) =>
      x.accounts.find((y) => y.uuid === uuid),
    );
    if (index === -1) return bot.reply(sender.username, "User does not exist!");
    playerNames.splice(index, 1);
    bot.utils.playerNamesDatabase.set("data", playerNames);
    bot.reply(sender.username, `Removed user ${user}`);
  },
};
