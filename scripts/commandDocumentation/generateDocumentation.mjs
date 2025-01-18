import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

async function generateDocumentation(
  options,
  commandCategories,
  doSimplified = false,
) {
  console.log(
    `Generating ${doSimplified ? "simplified (Discord)" : "full (GitHub)"} docs...`,
  );
  const templateLines = await fetchTemplate(
    doSimplified ? options.templateFile.discord : options.templateFile.github,
  );
  if (!templateLines) return;
  const markerIndices = findMarkers(
    templateLines,
    Object.keys(commandCategories),
  );
  if (Object.keys(markerIndices).length < 1) {
    console.error(
      "No marker comments were found in the current README.md file! Please add them and re-run this script.",
    );
    return;
  }
  const commandDirectory = await traverseDirectoryRecursive(
    path.join(import.meta.dirname, options.commandDirPathRelative),
  );
  let outputMdLines = [];
  let previousEndIndex = 0;
  for (const marker of markerIndices) {
    const category = commandCategories[marker.category];
    // filter commands for current section
    let filteredCommands = filterCommandsRecursive(
      commandDirectory,
      category.filter,
    );
    // sort commands according to section parameters
    if (category.sortBy)
      filteredCommands = sortCommandsRecursive(
        filteredCommands,
        category.sortBy,
      );
    // generate markdown section
    outputMdLines.push(
      ...templateLines.slice(
        previousEndIndex,
        marker.begin + (doSimplified ? 0 : 1),
      ),
    );
    for (const subsection of filteredCommands.subdirectories)
      outputMdLines.push(
        ...generateMarkdownSectionRecursive(
          subsection,
          commandCategories[marker.category],
          4,
          doSimplified,
        ),
      );
    previousEndIndex = marker.end + (doSimplified ? 1 : 0);
  }
  outputMdLines.push(...templateLines.slice(previousEndIndex));

  let outputMarkdown = outputMdLines.join("\n");
  if (!doSimplified) outputMarkdown = await formatMarkdown(outputMarkdown);
  return outputMarkdown;
}

async function fetchTemplate(currentReadme) {
  if (!currentReadme.value)
    console.warn("Template not configured for current mode, skipping...");
  if (currentReadme.isURL)
    try {
      // fetch file using an HTTP request
      const axios = await import("axios");
      return (await axios.get(currentReadme.value)).data.split("\n");
    } catch (err) {
      if (err.code === "ERR_MODULE_NOT_FOUND")
        console.error(
          "Unable to import axios in order to fetch the template file from the configured URL.",
        );
      console.error(
        `Something went wrong while trying to fetch the template file from the configured URL: ${err}`,
      );
    }
  else
    try {
      return (
        await fs.readFile(
          path.join(import.meta.dirname, currentReadme.value),
          "utf-8",
        )
      ).split("\n");
    } catch (err) {
      if (err.code === "ENOENT")
        console.error("Template file doesn't exist at specified path.");
      else
        console.error(
          `Something went wrong while trying to read the template file: ${err}.`,
        );
    }
}

function findMarkers(readmeLines, categoryNames) {
  let markers = [];
  // attempt to identify markers for each category
  for (const category of categoryNames) {
    const begin = readmeLines.findIndex(
      (line) => line === `<!--begin-section-${category}-commands-->`,
    );
    const end = readmeLines.findIndex(
      (line) => line === `<!--end-section-${category}-commands-->`,
    );
    // both begin and end markers exist
    if (begin >= 0 && end >= 0) {
      // detect wrong order of markers
      if (begin > end)
        console.warn(
          `Marker comments for category '${category}' in the README are in the wrong order! Skipping category...`,
        );
      // detect marker area overlaps
      else if (
        markers.some(
          (marker) =>
            (marker.begin > begin && marker.begin < end) ||
            (marker.end > begin && marker.end < end) ||
            (marker.begin < begin && marker.end > end),
        )
      )
        console.warn(
          `Marker comments for category '${category}' in the README overlap with another pair of markers! Skipping category...`,
        );
      else markers.push({ category: category, begin: begin, end: end });
    }
  }

  // sort markers
  markers.sort((marker1, marker2) => marker1.begin - marker2.begin);

  return markers;
}

async function traverseDirectoryRecursive(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const data = {
    subdirectories: [],
    commandFiles: [],
  };
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const directoryMetadata = await checkDirectoryInfo(fullPath);
      // skip directory if configured to be ignored
      if (directoryMetadata.ignoreDirectory) continue;
      const directoryContents = await traverseDirectoryRecursive(fullPath);
      // merge contained commands with parent directory if configured that way
      if (directoryMetadata.mergeWithParent) {
        data.commandFiles.push(...directoryContents.commandFiles);
        continue;
      }
      data.subdirectories.push({
        metadata: {
          title: directoryMetadata.title,
          description: directoryMetadata.description,
        },
        ...directoryContents,
      });
    } else if (entry.isFile() && path.extname(entry.name) === ".mjs") {
      let fileData;
      try {
        // import command file
        fileData = (await import(fullPath)).default;
      } catch {
        console.warn(
          `Something went wrong while importing a command file: '${fullPath}'. Skipping...`,
        );
        continue;
      }
      if (!fileData.ignore) {
        // remove command function itself, as it is unneeded
        delete fileData.execute;
        data.commandFiles.push(fileData);
      }
    }
  }
  return data;
}

async function checkDirectoryInfo(dirPath) {
  let configData;
  try {
    // read and parse metadata file
    const infoFile = await fs.readFile(path.join(dirPath, ".docmetadata.json"));
    configData = JSON.parse(infoFile);
  } catch (err) {
    if (err.code === "ENOENT")
      console.warn(
        `Directory metadata '.docmetadata.json' not found for directory '${dirPath}', using defaults...`,
      );
    else
      console.warn(
        `Directory metadata '.docmetadata.json' is not valid JSON for directory '${dirPath}', using defaults...`,
      );
  }
  return {
    title: configData?.title ?? path.basename(dirPath),
    description: configData?.description ?? "",
    ignoreDirectory: configData?.ignoreDirectory ?? false,
    mergeWithParent: configData?.mergeWithParent ?? false,
  };
}

function generateMarkdownSectionRecursive(
  commandDirectory,
  commandCategory,
  markdownHeadingLevel = 0,
  simplified = false,
  hideTitle = false,
) {
  let markdownContent = [];
  // write section title (limit heading level to 6, in case it ever exceeds that, as markdown & HTML don't support more)
  if (!hideTitle)
    markdownContent.push(
      `${"#".repeat(Math.min(markdownHeadingLevel, simplified ? 3 : 6))} ${simplified ? "▷ " : ""}${commandDirectory.metadata.title}`,
    );
  // write section description (unless generating simplified docs)
  if (!simplified && commandDirectory.commandFiles.length > 0) {
    markdownContent.push(commandDirectory.metadata.description);
    markdownContent.push(
      ...generateMarkdownTable(
        commandDirectory.commandFiles,
        commandCategory.fields,
      ),
    );
  } else if (simplified)
    // generate simplified commands list
    markdownContent.push(
      ...generateMarkdownList(
        commandDirectory.commandFiles,
        commandCategory.simplifiedField,
      ),
    );
  // process subsections recursively
  for (const subdir of commandDirectory.subdirectories)
    markdownContent.push(
      ...generateMarkdownSectionRecursive(
        subdir,
        commandCategory,
        markdownHeadingLevel,
        simplified,
        simplified,
      ),
    );
  return markdownContent;
}

function generateMarkdownTable(commands, tableFields) {
  // note: formatting, especially table spacing, is being "outsourced" to prettier, no need to reimplement if it already exists
  let tableLines = ["", "|", "|"];
  for (const field of tableFields) {
    tableLines[1] += `${field.fullName}|`;
    tableLines[2] += "---|";
  }
  for (const cmd of commands) {
    let line = "|";
    for (const field of tableFields) {
      // retrieve configured command property
      let cell = cmd[field.commandField];
      // call transformFunction if applicable
      if (field.transformFunction) cell = field.transformFunction(cell);
      // add surrounding characters and escape pipe symbols, which would break the table formatting
      if (cell)
        cell =
          (field.surroundContent ?? "") +
          cell.replace(/\|/g, "\\|") +
          (field.surroundContent ?? "");
      line += cell + "|";
    }
    tableLines.push(line);
  }
  return tableLines;
}

function generateMarkdownList(commands, simplifiedField) {
  let listLines = [];
  for (const cmd of commands) {
    // retrieve configured command property
    let line = cmd[simplifiedField.commandField];
    // call transformFunction if applicable
    if (simplifiedField.transformFunction)
      line = simplifiedField.transformFunction(line);
    // add surrounding characters
    line =
      (simplifiedField.surroundContent ?? "") +
      line +
      (simplifiedField.surroundContent ?? "");
    listLines.push("- " + line);
  }
  return listLines;
}

function filterCommandsRecursive(directory, filter) {
  let resultDirectory = { metadata: directory.metadata, subdirectories: [] };
  // filter command files according to filter parameters
  resultDirectory.commandFiles = directory.commandFiles.filter((commandFile) =>
    filter.values.includes(commandFile[filter.attribute]),
  );
  // process subdirectories recursively
  for (const subdir of directory.subdirectories) {
    resultDirectory.subdirectories.push(
      filterCommandsRecursive(subdir, filter),
    );
  }
  // omit subdirectories without any commands left after filtering
  resultDirectory.subdirectories = resultDirectory.subdirectories.filter(
    (subdir) =>
      subdir.commandFiles.length > 0 || subdir.subdirectories.length > 0,
  );
  return resultDirectory;
}

function sortCommandsRecursive(directory, sortBy) {
  // sort using < >, will work with alphanumberic characters
  directory.commandFiles.sort((item1, item2) =>
    item1[sortBy] < item2[sortBy] ? -1 : item1[sortBy] > item2[sortBy] ? 1 : 0,
  );
  // recursively apply to subdirectories
  directory.subdirectories.map((subdir) =>
    sortCommandsRecursive(subdir, sortBy),
  );
  return directory;
}

async function formatMarkdown(mdDocument) {
  // attempt to import prettier and have it format the document.
  // (formatting is functionally unnecessary, rendered version looks identical)
  try {
    const prettier = await import("prettier");
    mdDocument = prettier.format(mdDocument, { parser: "markdown" });
  } catch (err) {
    if (err.code === "ERR_MODULE_NOT_FOUND")
      console.warn("Prettier is not installed! Skipping formatting...");
    else
      console.error(
        `Prettier encountered an error while trying to format the document: ${err}\nSkipping formatting...`,
      );
  }
  return mdDocument;
}

async function saveFile(data, filePath) {
  if (!filePath)
    return console.error(
      "Output path not defined! Please configure a path and re-run.",
    );
  await fs.writeFile(path.join(import.meta.dirname, filePath), data);
}

// make sure this file isn't being imported from another module (in case we do that in the future)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // load the config file
  const { commandCategories, options } = await import("./docConfig.mjs");
  // generate and save full (GitHub) version
  await saveFile(
    await generateDocumentation(options, commandCategories, false),
    options.output.github,
  );
  // generate and save simplified (Discord) version
  await saveFile(
    await generateDocumentation(options, commandCategories, true),
    options.output.discord,
  );
}
