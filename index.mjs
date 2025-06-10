"use strict";
import dotenv from "dotenv";
dotenv.config();

import Utils, { utils } from "./src/utils/Utils.mjs";
import * as config from "./Config.mjs";
import JSONdb from "simple-json-db";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/** @type {JSONdb} */
const playerNamesDatabase = new JSONdb(
  path.resolve(__dirname, "./data/playerNames.json"),
);
/** @type {JSONdb} */
const generalDatabase = new JSONdb(
  path.resolve(__dirname, "./data/generalDatabase.json"),
);
utils.setPlayerNameDatabase(playerNamesDatabase);
utils.setGeneralDatabase(generalDatabase);
utils.setDebug(config.default.debug.general);

let myBot;
if (config.default.debug.disableMinecraft) {
  console.log("Minecraft bot disabled");
} else {
  myBot = await import("./src/mineflayer/Bot.mjs");
  myBot = myBot.default;
  myBot.setUtilClass(utils);
  await myBot.loadCommands();
  myBot.setConfig(config.default);
}

let discordBot;
if (config.default.debug.disableDiscord) {
  console.log("Discord bot disabled");
} else {
  discordBot = await import("./src/discord/Discord.mjs");
  discordBot = discordBot.default;
  discordBot.setUtils(utils);
  discordBot.setConfig(config.default);
}

refreshConfig();
refreshBanRegistry();

// Used to refresh allowList every 10 seconds
function refreshConfig() {
  setInterval(async () => {
    try {
      const configModule = await import(`./Config.mjs?cacheBust=${Date.now()}`);
      // config = configModule.default; // Access the default export of the JSON module
      if (!config.default.debug.disableMinecraft)
        myBot.setConfig(configModule.default);
      if (!config.default.debug.disableDiscord)
        discordBot.setConfig(configModule.default);
      // DEBUG: console.log("Allowlist updated:", allowlist);
    } catch (error) {
      console.error("Error updating allowlist:", error);
    }
  }, 10000);
}

// Used to refresh banRegistry every 60 seconds
function refreshBanRegistry() {
  setInterval(async () => {
    try {
      const now = Date.now();
      for (const [username, banData] of Object.entries(registry.bans)) {
        if (banData.banEnd !== Infinity && banData.banEnd.getTime() <= now) {
          delete registry.bans[username];
          console.log(`Ban for ${username} has expired and was removed.`);
        }
      }
    } catch (error) {
      console.error("Error refreshing ban registry:", error);
    }
  }, 60000);
}

process.stdin.on("data", dataInput);

function dataInput(data) {
  data = data.toString().trim();
  if (data.startsWith("/")) myBot.chat(data);
  else if (data.startsWith(myBot.config.partyCommandPrefix))
    myBot.onMessage(
      new Utils.CustomMessage(
        `[35mFrom [31m[CONSOLE] ${myBot.getUsername()}[37m: ${data}[0m`,
      ),
    );
  else if (data.startsWith("!dc")) return; // Add Discord bot stuff
}
