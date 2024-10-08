export default {
  name: ["test", "testpermissions", "testperms", "testcommand"],
  ignore: false,
  description: "Test command",
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    let userPerms = bot.utils.getPermissionsByUser({ name: sender.username });
    if (userPerms) {
      // bot.bot.chat(`/w ${sender.username} You have permission level: ${userPerms}`);
      bot.reply(sender, `You have permission level: ${userPerms}`);
    }
  }
}
