"use strict";
import dotenv from "dotenv";
dotenv.config();

import mineflayer from "mineflayer";
import myBot from "./src/mineflayer/Bot.mjs";
import { utils } from "./src/utils/Utils.mjs";
import * as config from "./Config.mjs";
import JSONdb from "simple-json-db";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import discordBot from "./src/discord/Discord.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/** @type {JSONdb} */
const playerNamesDatabase = new JSONdb(
  path.resolve(__dirname, "./data/playerNames.json")
);
/** @type {JSONdb} */
const generalDatabase = new JSONdb(
  path.resolve(__dirname, "./data/generalDatabase.json")
);
utils.setPlayerNameDatabase(playerNamesDatabase);
utils.setGeneralDatabase(generalDatabase);

myBot.setUtilClass(utils);
myBot.setConfig(config.default);
refreshConfig()

process.stdin.on("data", dataInput);

// Used to refresh allowList every 10 seconds
function refreshConfig() {
  setInterval(async () => {
    try {
      const configModule = await import(
        `./Config.mjs?cacheBust=${Date.now()}`
      );
      // config = configModule.default; // Access the default export of the JSON module
      myBot.setConfig(configModule.default);
      // DEBUG: console.log("Allowlist updated:", allowlist);
    } catch (error) {
      console.error("Error updating allowlist:", error);
    }
  }, 10000);
}

function dataInput(data) {
  data = data.toString().trim();
  if (data.startsWith("/")) mybot.reply(data);
  else if (data.startsWith(myBot.config.partyCommandPrefix)) myBot.onMessage({
    content: `From [CONSOLE] ${myBot.bot.username}: ${data}`,
    self: true
  });
  else if (data.startsWith("!dc")) return; // Add Discord bot stuff
}