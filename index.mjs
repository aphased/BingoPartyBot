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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/** @type {JSONdb} */
const playerNamesDatabase = new JSONdb(
  path.resolve(__dirname, "./data/playerNames.json")
);
utils.setPlayerNameDatabase(playerNamesDatabase);

myBot.setUtilClass(utils);
myBot.setConfig(config.default);

process.stdin.on("data", dataInput);

function dataInput(data) {
  data = data.toString().trim();
  if (data.startsWith("/")) myBot.bot.chat(data);
  else if (data.startsWith(myBot.config.partyCommandPrefix)) myBot.onMessage(`From [CONSOLE] ${myBot.bot.username}: ${data}`);
  else if (data.startsWith("!dc")) return; // Add Discord bot stuff
}
