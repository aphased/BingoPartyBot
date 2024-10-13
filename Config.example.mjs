import { WebhookMessageType } from "./src/utils/Interfaces.mjs";

export default {
  partyCommandPrefix: "!p",
  mineflayerInfo: {
    authType: "microsoft",
    email: "EMAIL OF ACCOUNT HERE",
  },
  webhook: {
    // TODO: add support for multiple URLS here too, just like for bridge
    url: "WEBHOOK API URL HERE", // This is for main bot logging
    name: "BingoParty Bridge",
    avatarUrl: "",
    bridge: [
      {
        // These are for ingame logging, check the WebhookMessageType interface in src/utils/Interfaces.mjs for more info
        webhookUrl: "",
        messageType: WebhookMessageType.All,
      },
    ],
  },
  discordBotInfo: {
    token: "DISCORD BOT TOKEN HERE (or empty string)",
    guideChannel: "ID for the channel which has bingo guide links",
  },
  guideLink: "", // I advise you to keep this empty, and just use discord commands to set the guide link or the guide channel.
  showMcChat: true,
  debug: {
    // IF YOU DONT KNOW WHAT YOU ARE DOING DO NOT TOUCH THIS. THIS IS MADE FOR DEVELOPERS TO DEBUG THE BOT ONLY
    general: true,
    disableMinecraft: false,
    disableDiscord: false,
    disableAutoLimbo: false
  },
};
