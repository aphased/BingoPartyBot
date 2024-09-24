export default {
  partyCommandPrefix: "!p",
  mineflayerInfo: {
    authType: "microsoft",
    email: "EMAIL OF ACCOUNT HERE",
  },
  webhook: {
    url: "WEBHOOK API URL HERE",
    name: "BingoParty Bridge",
    avatarUrl: "",
  },
  guideLink: "",
  showMcChat: true, // for console output
  discordBotInfo: {
    token: "DISCORD BOT TOKEN HERE (or empty string)",
  },
  debug: {
    // IF YOU DONT KNOW WHAT YOU ARE DOING DO NOT TOUCH THIS. THIS IS MADE FOR DEVELOPERS TO DEBUG THE BOT ONLY
    general: true,
    disableMinecraft: false,
    disableDiscord: false,
  },
};
