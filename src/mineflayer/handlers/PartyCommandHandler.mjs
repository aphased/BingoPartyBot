import { Collection } from "discord.js";
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
    } else if ([".mjs", ".js", ".cjs"].includes(path.extname(filePath))) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Loads and returns a collection of party commands from the commands directory.
 *
 * This asynchronous function scans the commands directory for command files,
 * imports them dynamically, and stores them in a Collection. Each command
 * is expected to have a default export which must include a `name` property
 * and an optional `ignore` property. If the `ignore` property is false or
 * undefined, the command will be added to the returned collection. In the
 * future, this might expand to requiring a command description, too.
 *
 * The function handles errors that may occur while reading the directory
 * and importing the command files, logging them to the console and
 * rethrowing the error.
 *
 * @async
 * @function loadPartyCommands
 * @returns {Promise<Collection>} A Promise that resolves to a Collection of
 * party commands, where each command is keyed by its name.
 *
 * @throws {Error} Throws an error if there was an issue reading the directory
 * or importing the command files.
 */
export default async function loadPartyCommands() {
  let partyCommands = new Collection();
  const commandsPath = path.resolve(__dirname, "../commands/");

  try {
    const files = await readDirectoryRecursive(commandsPath);

    const importPromises = files.map(async (file) => {
      console.log("Found file:", file);
      const command = await import(
        pathToFileURL(file).href + `?cacheBust=${Date.now()}`
      );
      if (!command.default.ignore)
        partyCommands.set(command.default.name, command.default);
    });

    await Promise.all(importPromises);
    return partyCommands;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
}
