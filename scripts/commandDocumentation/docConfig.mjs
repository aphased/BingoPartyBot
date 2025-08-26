const permissionRanks = Object.freeze({
  Public: -1,
  ExSplasher: 0,
  HoB: 1,
  Splasher: 2,
  Staff: 3,
  Admin: 4,
  Owner: 5,
});

// Possible columns for the generated tables, used in commandCategories
const tableColumns = Object.freeze({
  //exampleColumn: {
  //  fullName: "Example Column Title", // the title to be displayed on the generated column
  //  surroundContent: "`", // Character to surround all values with
  //  transformFunction: (item) => item, // custom function to run on every value
  //  commandField: "example" // name of the command object property to read for this column
  //},
  mainName: {
    fullName: "Command",
    surroundContent: "`",
    transformFunction: (item) => item[0],
    commandField: "name",
  },
  description: {
    fullName: "Functionality",
    commandField: "description",
  },
  usage: {
    fullName: "Usage",
    surroundContent: "`",
    transformFunction: (item) => item.replace(/ \| /g, "` or `"),
    commandField: "usage",
  },
  permission: {
    fullName: "Permission",
    transformFunction: (item) =>
      Object.keys(permissionRanks).find(
        (rank) => permissionRanks[rank] === (item ?? -1),
      ),
    commandField: "permission",
  },
  aliases: {
    fullName: "Aliases",
    surroundContent: "`",
    transformFunction: (item) => item.slice(1).join("`, `"),
    commandField: "name",
  },
});

// Categories to sort the commands into. Locations in the readme are separately
// defined using markers, commands can be listed more than once (not the case by default)
export const commandCategories = Object.freeze({
  //exampleCategory: {
  //  filter: {
  //    attribute: "commandAttribute", // by which attribute to filter the commands
  //    values: [ // allowed values for above attribute
  //      "value1",
  //      "value2",
  //      "value3"
  //    ]
  //  },
  //  fields: [ // which columns the tables in this category should be composed of
  //    tableColumns.exampleColumn,
  //    tableColumns.anotherColumn,
  //  ],
  //  simplifiedField: tableColumns.exampleColumn, // which single attribute to use in simplified (Discord) mode
  //  sortBy: "commandAttribute", // by which attribute to sort the commands (sorting implementation supports letters and numbers)
  //},
  splasher: {
    filter: {
      attribute: "permission",
      values: [
        permissionRanks.ExSplasher,
        permissionRanks.HoB,
        permissionRanks.Splasher,
      ],
    },
    fields: [
      tableColumns.mainName,
      tableColumns.usage,
      tableColumns.description,
      tableColumns.aliases,
    ],
    simplifiedField: tableColumns.mainName,
  },
  staff: {
    filter: {
      attribute: "permission",
      values: [
        permissionRanks.Staff,
        permissionRanks.Admin,
        permissionRanks.Owner,
      ],
    },
    fields: [
      tableColumns.mainName,
      tableColumns.permission,
      tableColumns.usage,
      tableColumns.description,
      tableColumns.aliases,
    ],
    simplifiedField: tableColumns.mainName,
    sortBy: "permission",
  },
  public: {
    filter: {
      attribute: "permission",
      values: [permissionRanks.Public, undefined],
    },
    fields: [
      tableColumns.mainName,
      tableColumns.description,
      tableColumns.aliases,
    ],
    simplifiedField: tableColumns.mainName,
  },
});

export const options = Object.freeze({
  commandDirPathRelative: "../../src/mineflayer/commands", // Where to look for command files
  templateFile: {
    github: {
      isURL: true, // Whether the value is an URL or a (relative) file path
      // URL or relative file path to the current README with category markers
      value:
        "https://raw.githubusercontent.com/aphased/BingoPartyCommands/refs/heads/main/README.md",
    },
    discord: {
      isURL: false, // Whether the value is an URL or a (relative) file path
      value: "./TEMPLATE_DISCORD.md", // URL or relative file path to the discord message template with category markers
    },
  },
  output: {
    github: "./COMMANDS-README.md", // Full command list as configured, designed for github's full markdown support
    discord: "./COMMANDS-DISCORD.md", // Stripped down command list consisting of just the names, suitable for discord's limited formatting capabilities
  },
});
