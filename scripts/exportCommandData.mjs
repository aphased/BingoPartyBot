import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

// adjust as needed
const options = {
  // path to command files
  commandDirectoryPath: path.resolve(
    import.meta.dirname,
    "../src/mineflayer/commands",
  ),

  // whether to group commands into categories depending on their directory
  sortSeparateDirectories: true,

  // whether to output multi-line indented JSON
  prettyJSON: false,

  // whether to write the output to a file
  outputToFile: false,

  // path to output file
  outputFilePath: path.resolve(import.meta.dirname, "commandData.json"),

  // which command properties to include (and in which order)
  includedProperties: {
    name: true,
    description: true,
    usage: true,
    permission: true,
    isPartyChatCommand: false,
    disableCommand: false,
  },
};

async function loadFilePathsRecursive(directoryPath) {
  let files = [];

  for (const file of await fs.readdir(directoryPath, { withFileTypes: true })) {
    const filePath = path.resolve(directoryPath, file.name);

    if (file.isDirectory())
      files = files.concat(await loadFilePathsRecursive(filePath));
    else files.push(filePath);
  }

  return files;
}

async function loadCommandData(options) {
  const filePaths = await loadFilePathsRecursive(options.commandDirectoryPath);

  let commandData = options.sortSeparateDirectories ? {} : [];

  for (const filePath of filePaths) {
    const fileData = (await import(pathToFileURL(filePath).href)).default;
    if (!fileData.ignore) {
      let data = {};
      // filter properties according to options
      Object.entries(options.includedProperties).forEach(([key, value]) => {
        if (value) data[key] = fileData[key];
      });

      if (options.sortSeparateDirectories) {
        const directoryName = path.basename(path.dirname(filePath));

        if (!commandData[directoryName]) commandData[directoryName] = [];
        commandData[directoryName].push(data);
      } else commandData.push(data);
    }
  }

  return commandData;
}

const commandJSON = JSON.stringify(
  await loadCommandData(options),
  null,
  options.prettyJSON ? 2 : 0,
);

if (options.outputToFile)
  await fs.writeFile(options.outputFilePath, commandJSON);

console.log(commandJSON);
