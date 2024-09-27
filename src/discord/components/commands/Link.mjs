import { ApplicationCommandOptionType, Client, EmbedBuilder } from "discord.js";

export default {
  name: "link",
  ignore: false,
  description: "Link your account to the bot",
  /**
   *
   * @param {import("../../Discord.mjs").default} bot
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async function (bot, interaction) {
    // code
    await interaction.deferReply({
      ephemeral: true,
    });

    // console.log(bot)

    let code = bot.utils.link.addCode(interaction.user.id);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL(),
          })
          .setTitle("Link your account")
          .setDescription(
            `To link your account to the bot, use the following code in the game: \`${code}\``
          )
          .setColor("Green")
          .setTimestamp()
          .setFooter({
            text: "You have 5 minutes to link your account",
          }),
      ],
    });

    let repetitions = 0;
    setInterval(async () => {
      if (repetitions >= 30) {
        clearInterval();
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL(),
              })
              .setTitle("Link your account")
              .setDescription(
                "You have exceeded the maximum time to link your account"
              )
              .setColor("Red")
              .setTimestamp(),
          ],
        });
        bot.utils.link.removeCode(code);
        return;
      }
      let status = bot.utils.link.getId(code);
      if (!status) return clearInterval();
      if (status.verified) {
        clearInterval();
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL(),
              })
              .setTitle("Link your account")
              .setDescription(
                "Your account has been linked successfully to `" +
                  status.username +
                  "`"
              )
              .setColor("Green")
              .setTimestamp(),
          ],
        });
        bot.utils.link.removeCode(code);
        bot.utils.setDiscord({
          name: status.username,
          discordId: interaction.user.id,
        });
        return;
      }
      repetitions++;
    }, 10000);
  },
};
