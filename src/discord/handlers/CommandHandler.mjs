import { Collection, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
// Get the directory name of the current file
const __dirname = path.dirname(__filename);

/**
 * Will help with hot reloading commands in the future and making code base cleaner.
 *
 */
async function readDirectoryRecursive(dir) {
  let results = [];
  const list = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const file of list) {
    const filePath = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await readDirectoryRecursive(filePath));
    } else {
      results.push(filePath);
    }
  }

  return results;
}

export default async function loadDiscordCommands() {
  let discordCommands = new Collection();
  const commandsPath = path.resolve(__dirname, "../components/commands");

  try {
    const files = await readDirectoryRecursive(commandsPath);

    const importPromises = files.map(async (file) => {
      console.log("Found file:", file);
      const command = await import(
        pathToFileURL(file).href + `?cacheBust=${Date.now()}`
      );
      if (!command.default.ignore)
        discordCommands.set(command.default.name, command.default);
    });

    await Promise.all(importPromises);

    return discordCommands;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
}

export async function registerCommands(client, token, commands) {
  const rest = new REST({ version: "10" }).setToken(token);
  try {
    await rest.put(Routes.applicationCommands(client.application.id), {
      body: commands,
    });
  } catch (error) {
    console.log(error);
  }
}
