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

export default async function loadPartyCommands() {
  let partyCommands = new Collection();
  const commandsPath = path.resolve(__dirname, '../commands/');

  try {
    const files = await readDirectoryRecursive(commandsPath);

    const importPromises = files.map(async file => {
      console.log('Found file:', file);
      const command = await import(pathToFileURL(file).href + `?cacheBust=${Date.now()}`);
      if (!command.default.ignore) partyCommands.set(command.default.name, command.default);
    });

    await Promise.all(importPromises);
    return partyCommands;
  } catch (err) {
    console.error('Error reading directory:', err);
    throw err;
  }
}
