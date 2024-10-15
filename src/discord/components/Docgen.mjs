// perma-link to up to date version of the documentation repo's file:
// "https://raw.githubusercontent.com/aphased/BingoPartyCommands/main/README.md"

// TODO: use the below function as well as extractAllDescriptions from Utils.mjs
// after pasting from the example file for a Discord slash command (move to
// components/commands for the "manual" aspect of it? **OR** work with webhooks
// to register any change to the documentation repo and have it register & act
// on every push to _that_ repo? hmm…)

// TODO: name the Discord command (and this file) something like update
// documentation channel?

// TODO: _write_ the Discord command

// TODO: add field in config for #command-documentation channel(**s**)
// (TODO: add support for several channel ID entries in that config array, then
// ask indigo to create a new channel in bingo brewers?!)

// TODO: make the external repo itself fetch from the command objects and then
// generate the markdown file (and this discord summary/version of it) within
// the main repo itself?!

/**
 * Function to transform the markdown table used in the [documentation repo](
 * https://github.com/aphased/BingoPartyCommands) into a Discord-friendly format
 */
function transformMarkdownToDiscord(markdown) {
  // Split the text into sections
  const sections = markdown.trim().split("### ");
  let discordMessage = "";

  // First section is before the first command table
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    //  Add section title
    const [title, content] = section.split("\n", 2);
    discordMessage += `**${title.trim()}**\n`;

    // Process the command table
    const lines = content.trim().split("\n");
    // Skip the header and divider
    for (let j = 2; j < lines.length; j++) {
      const line = lines[j];
      if (!line.startsWith("|")) continue;
      //  Split the line into components based on '|'
      const parts = line.split("|").map((part) => part.trim());
      const command = parts[1] ? parts[1] : "";
      const functionality = parts[2] ? parts[2] : "";
      const aliases = parts[3] ? parts[3] : "";
      // Format for Discord
      discordMessage += `\`${command}\`: ${functionality.trim()} [Aliases: ${aliases.trim()}]\n`;
    }
    discordMessage += "\n"; // # New line for spacing between sections
  }

  return discordMessage.trim();
}

/* From src/discord/components/commands/ExampleCommand.mjs: */
// import { ApplicationCommandOptionType, Client } from "discord.js";

// export default {
//   name: "example",
//   options: [
//     {
//       name: "example",
//       description: "example",
//       type: ApplicationCommandOptionType.String,
//     },
//   ],
//   ignore: true,
//   description: "example",
//   /**
//    *
//    * @param {Client} bot
//    * @param {import("discord.js").Interaction} interaction
//    */
//   execute: async function (bot, interaction) {},
// };
