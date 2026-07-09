import path from "path";
import { fileURLToPath } from "url";
import { VerbosityLevel, WebhookMessageType } from "./src/utils/Interfaces.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  partyCommandPrefix: "!p",
  mineflayerInfo: {
    authType: "microsoft",
    email: "EMAIL OF ACCOUNT HERE",
    prismTokenImport: {
      // Optional. If empty, scripts check common Prism Launcher locations:
      // macOS: ~/Library/Application Support/PrismLauncher/accounts.json
      // Linux: $XDG_DATA_HOME/PrismLauncher/accounts.json, ~/.local/share/PrismLauncher/accounts.json, or the Flatpak data path
      // Windows: %APPDATA%/PrismLauncher/accounts.json
      accountsFile: "",
      accountName: "MINECRAFT IGN OR UUID HERE",
      cacheUsername: "EMAIL OF ACCOUNT HERE",
    },
    microsoftAuth: {
      profilesFolder: path.join(__dirname, ".auth-cache"),
      flow: "sisu",
      authTitle: "00000000402b5328", // Minecraft Java client ID
      deviceType: "Win32",
      forceRefresh: false, // set true once if you need to discard cached tokens
    },
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
      __dirname,
      "./scripts/commandDocumentation/COMMANDS-DISCORD.md",
    ), // Local path where the bot should look for new discord documentation to post
  },
  guideLink: "", // I advise you to keep this empty, and just use discord commands to set the guide link or the guide channel.
  showMcChat: true,
  verbosityMc: VerbosityLevel.Full, // verbosity level for minecraft chat messages
  usernameRefreshInterval: 2 * 60 * 60 * 1000, // in milliseconds, default is 2h (2 * 60 * 60 * 1000ms)
  persistentDisabledCommands: true, // store disabled commands in `generalDatabase.json`, persistent across restarts
  enableDiscordDocsUpdate: true, // whether to automatically update the discord documentation channel on bot startup
  bingoSchedule: {
    enabled: false, // enable automatic Minecraft login/logout around Bingo event times
    autoConnectBeforeMinutes: 5, // connect this many minutes before Bingo starts
    autoDisconnectAfterMinutes: 10, // stay connected this many minutes after Bingo ends
    pollIntervalMinutes: 5, // how often to refresh Bingo event times from the Hypixel API
  },
  debug: {
    // IF YOU DONT KNOW WHAT YOU ARE DOING DO NOT TOUCH THIS. THIS IS MADE FOR DEVELOPERS TO DEBUG THE BOT ONLY
    general: true,
    disableMinecraft: false,
    disableDiscord: false,
    disableAutoLimbo: false,
    disableUsernameRefresh: false,
  },
};
