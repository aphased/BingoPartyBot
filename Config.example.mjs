import path from "path";
import { VerbosityLevel, WebhookMessageType } from "./src/utils/Interfaces.mjs";

export default {
  partyCommandPrefix: "!p",
  mineflayerInfo: {
    authType: "microsoft",
    email: "EMAIL OF ACCOUNT HERE",
  },
  webhooks: [
    {
      // Bingo Party main action logs
      webhookUrl: "", // Add a webhook url here
      messageType: WebhookMessageType.ActionLog,
    },
    {
      // Default bridge configuration
      webhookUrl: "", // Add a webhook url here
      messageType: WebhookMessageType.Bridge,
    },
    // Add more webhooks as needed, check the WebhookMessageType interface in src/utils/Interfaces.mjs for more info
  ],
  discordBotInfo: {
    token: "", // Add discord bot token here (or leave empty for operation without bot)
    guideChannel: "", // ID for the channel which has bingo guide links
    commandDocumentationChannels: [], // array of documentation channel IDs
    discordDocsPathRelative: path.join(
      import.meta.dirname,
      "./scripts/commandDocumentation/COMMANDS-DISCORD.md",
    ), // Local path where the bot should look for new discord documentation to post
  },
  guideLink: "", // I advise you to keep this empty, and just use discord commands to set the guide link or the guide channel.
  showMcChat: true,
  verbosityMc: VerbosityLevel.Full, // verbosity level for minecraft chat messages
  usernameRefreshInterval: 2 * 60 * 60 * 1000, // in milliseconds, default is 2h (2 * 60 * 60 * 1000ms)
  persistentDisabledCommands: true, // store disabled commands in `generalDatabase.json`, persistent across restarts
  enableDiscordDocsUpdate: true, // whether to automatically update the discord documentation channel on bot startup
  debug: {
    // IF YOU DONT KNOW WHAT YOU ARE DOING DO NOT TOUCH THIS. THIS IS MADE FOR DEVELOPERS TO DEBUG THE BOT ONLY
    general: true,
    disableMinecraft: false,
    disableDiscord: false,
    disableAutoLimbo: false,
    disableUsernameRefresh: false,
  },
};
