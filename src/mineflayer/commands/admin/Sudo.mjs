import { Permissions } from "../../../utils/Interfaces.mjs";
import loadPartyCommands from "../../handlers/PartyCommandHandler.mjs";

export default {
  name: ["sudo"], // TODO: this is not the implementation for sudo that jbanate had in mind, I believe – aphased
  // yur correct it is not
  ignore: false,
  description: "Disabled",
  permission: Permissions.Owner, // TODO: change this to on a per-player basis instead of per-rank?
  // maybe, staff should work for now but wed need to change the json as well for that

  // read drain.mjs lmfao
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    bot.chat(args.join(" "));
    await bot.utils.waitForDelay(bot.utils.minMsgDelay);
      bot.reply(sender, `Sent "${args.join(" ")}" in chat.`);
  },
};
