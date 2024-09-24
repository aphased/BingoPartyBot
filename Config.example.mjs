import { WebhookMessageType } from "./src/utils/Interfaces.mjs";

export default {
  partyCommandPrefix: "!p",
  mineflayerInfo: {
    authType: "microsoft",
    email: "EMAIL OF ACCOUNT HERE",
  },
  webhook: {
    url: "WEBHOOK API URL HERE", // This is for main bot logging
    name: "BingoParty Bridge",
    avatarUrl: "",
    bridge: [
      { // These are for ingame logging, check the WebhookMessageType interface in src/utils/Interfaces.mjs for more info
        webhookUrl: "",
        messageType: WebhookMessageType.All,
      },
    ],
  },
  discordBotInfo: {
    token: "DISCORD BOT TOKEN HERE (or empty string)",
  },
  guideLink: "",
  showMcChat: true,
  debug: {
    // IF YOU DONT KNOW WHAT YOU ARE DOING DO NOT TOUCH THIS. THIS IS MADE FOR DEVELOPERS TO DEBUG THE BOT ONLY
    general: true,
    disableMinecraft: false,
    disableDiscord: false,
  },
};
