import { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
// Get the directory name of the current file
const __dirname = path.dirname(__filename);

/**
 * Will help with hot reloading commands in the future and making code base cleaner.
 *
 */
export default async function loadPartyCommands() {
  let partyCommands = new Collection();
  const commandsPath = path.resolve(__dirname, '../commands/party/');

  try {
    const files = await fs.promises.readdir(commandsPath);

    const importPromises = files.map(async file => {
      console.log('Found file:', file);
      const commandPath = path.resolve(commandsPath, file);
      const command = await import(pathToFileURL(commandPath).href);
      if(!command.default.ignore) partyCommands.set(command.default.name, command.default.execute);
    });

    await Promise.all(importPromises);
    return partyCommands;
  } catch (err) {
    console.error('Error reading directory:', err);
    throw err;
  }
}
