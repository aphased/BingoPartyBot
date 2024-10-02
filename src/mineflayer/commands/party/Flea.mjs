import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
  name: ["flea", "bossflea", "bf"], // This command will be triggered by either command1 or command2
  ignore: false, // Whether to ignore this file or not
  description: "Special flavor of/extra alias for a custom repeat command", // Description of the command
  permission: Permissions.Trusted, // Permission level required to execute
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // This commands produces a splash message to party chat, "BossFlea style":
    // 4 repetitions à 4 seconds apart, then a pause of 20 seconds, then a
    // final fifth one

    // TODO: The two marked lines below will currently lead to a crash, so they
    // are commented out. However, they are "basically functional" in logic
    // apart from some mistake in terms of syntax or similar, which is why
    // they're kept in for reference.
    // Conutik:
    // bot.partyCommands.find(x=>x.includes("repeat")).execute(bot,sender,`4 4 ${args.join(" ")}`.split(" "))

    // TODO: bot.partyCommands.get("repeat").execute(bot, sender, `4 4 ${args}`);

    setTimeout(() => {
      // TODO: bot.partyCommands.get("say").execute(bot, sender, args);
      // equivalent to?:
      // bot.chat(`/pc ${sender.username}: ${args.slice(startIndex).join(" ")}`);
    }, 16_000 + 20_000);
  },
};
