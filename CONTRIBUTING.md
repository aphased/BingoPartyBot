# Contributing

Thanks for wanting to improve the BingoParty bot! This document describes some
important things you should know regarding the project setup and code.
For a general introduction, go through the [Readme file](./README.md).  

**Please keep in mind that this file's contents are currently undergoing a
rewrite** (and hopefully won't remain as unstructured).
At the current point in time, this document may feature potentially incorrect, and
almost certainly incomplete info, too.

## Getting set up & related topics

### Code & module structure

For potential contributors, or myself, when coming back to fix or extend something:

<!-- - Start the bot (in my case on a Linux server) by executing
`./BingoPartyBot/run-bot` in the shell, which will start Node
    - There is also a `.bat` file now for launching/testing the bot locally on Windows.
    It does not (yet) re-launch automatically on crash unlike the Unix script.
- In addition to initializing the bot, `index.mjs` enables command input
in-game via the console stdin
- Registering the chat listeners is done in `bot.mjs`
- Chat messages are parsed and acted upon in `modules/handleMessage.mjs`
- After an extra layer of preparing/"sanitizing" messages incl. sender checks
  (`modules/handleCommand.mjs`), the "main features", party commands, are implemented
  and send results out to the game/Hypixel in `sharedCoreFunctionality.mjs`
  (_shared_ as this is the part which could be re-used in both
  the ChatTriggers and Mineflayer code)
- `boolChecks.mjs` and `utils.mjs` are modules with helper functionality
- data is stored in the `data` directory: `playerNames.json`,
`bingoBrewersRules.json`, and `autokickWords.json` (WIP on `banned.json`)
- `manageData.mjs` to interact with said data (also partially WIP) -->

- TODO: update this section with some explanations. For now, a handy overview
list of files:

<!-- (generated from !`tree -I node_modules` then auto-inserted in Helix) -->

```tree
.
├── CONTRIBUTING.md
├── Config.example.mjs
├── Config.mjs
├── README.md
├── convert-data-util.mjs
├── data
│   ├── autoKickWords.json
│   ├── backup-playerNames.json
│   ├── banned.json
│   ├── bingoBrewersRules.json
│   ├── generalDatabase.json
│   ├── playerNames.json
├── index.mjs
├── package-lock.json
├── package.json
├── run-bot
└── src
    ├── discord
    │   ├── Discord.mjs
    │   ├── components
    │   │   └── commands
    │   │       └── (all Discord slash commands)
    │   ├── handlers
    │   │   └── CommandHandler.mjs
    │   └── old.mjs
    ├── mineflayer
    │   ├── Bot.mjs
    │   ├── commands
    │   │   ├── EXAMPLECOMMAND.mjs
    │   │   ├── admin
    │   │   │   └── (in-game commands for admin activities)
    │   │   ├── misc
    │   │   │   └── (in-game commands for users and their data)
    │   │   ├── party
    │   │   │   └── (in-game commands mimicking Hypixel commands for parties)
    │   │   └── sudo
    │   │       └── (in-game commands for rarely used/critical actions)
    │   ├── events
    │   │   ├── MessageEvent.mjs
    │   │   ├── OnKick.mjs
    │   │   └── OnceLogin.mjs
    │   └── handlers
    │       └── PartyCommandHandler.mjs
    └── utils
        ├── Interfaces.mjs
        ├── Utils.mjs
        └── Webhook.mjs
```

### How to run

If you are a **user** of the BingoParty bot system, you do not need to install
anything (same as with the previous version based on ChatTriggers),
see [the table here](https://github.com/aphased/BingoPartyCommands?tab=readme-ov-file#all-available-commands)
on how to use.

If you want to **run** this system yourself, or would like to experiment with
the code, you can:

- Install [NodeJS](https://nodejs.org/en/download/prebuilt-installer/current),
  which is the runtime used for the bot
- (optionally) Install the [Prettier](https://prettier.io/docs/en/install#set-up-your-editor)
  formatter if you're going to modify the code and plan on merging the changes
  back into the main project
- Then, `git clone https://github.com/aphased/BingoPartyBot`
- Execute `npm install` in your command line to get the dependencies installed
- Duplicate the file `Config.example.mjs` and rename it to `Config.mjs`. Then,
  fill out the values for your bot Minecraft account's Microsoft email, and
  optionally the values needed for Discord integration.

Regarding the database:
- On the first launch, the bot will promptly exit if it doesn't find the player
  allowlist file at `data/playerNames.json` populated, leaving a new/empty
  template file there for you to fill out with your potential main account's IGN
  as the bot owner.
- Alternatively, copy the `data/backup-playerNames.json` list into the file and
  work with the "canonical" allowed player database right away, in which case
  you *will* grant other people with permissions chat access to your designated
  bot Minecraft account!

<!-- TODO: make sure this is all covered somewhere in the above explanation, then delete -->
<!-- - Fill in credentials for authenticating the Minecraft to-be-bot account in a
  new `.env` file according to the template structure
    - The minimal file contents are as follows:
    ```env
    ACCOUNT_AUTH_TYPE=microsoft
    MINECRAFT_EMAIL=your@mc-account.email
    PARTY_BOT_PREFIX=!p
    ```
    - Copy the "simple" `.env` template file and fill it out with your values
    if you would like to skip setting up Discord integration in the beginning
- (optionally) Adapt the entry with property `permissionRank: botAccountOwner`
  to your main account's Minecraft IGN in `data/playerNames.json` to gain full admin
  privileges and access to [all commands](https://github.com/aphased/BingoPartyCommands?tab=readme-ov-file#admin-commands) -->
<!-- - After executing `npm install` to get the dependencies installed, you will have to modify two lines of the Mineflayer library to fix a crash on startup. -->
  <!-- fixed at least since in mineflayer >= 4.20.1, yay! -->
  <!-- Comment out the lines assigning `entity.mobType` and `entity.objectType`, which will be around line 170-190 (depending on your version) in the file `node_modules/mineflayer/lib/plugins/entities.js`:
  ```js
  if (entityData) {
    //      entity.mobType = entityData.displayName
    //      entity.objectType = entityData.displayName
    entity.displayName = entityData.displayName;
    entity.entityType = entityData.id;
    // …
  } // …
  ``` -->

At this point, you may finally:
- Run `./BingoPartyBot/run-bot` for Unix (Linux/macOS/…), on Windows you can
execute the `run-bot.bat` file (which will however _not_ restart the bot upon crashes)
– or just `node .`, which will also not restart on crash, but works everywhere
- Add something for (re)starting with more convenience and only needing to
remember a single command to to your .{shell}rc config file, for example
using `screen`: `alias restartbpb="screen -d -RR bpb $HOME/BingoPartyBot/run-bot"`
<!-- - Additional things (mostly so I have a place in which to look them up):
    - When SSH'd into the server, start a session using e.g. `screen -S bpb ./BingoPartyBot/run-bot`
    so that it persists connection resets (see `restartbpb` command alias above)
    - Reconnect to running session: `screen -r bpb`, exit viewing (not _quitting_ the program) with `ctrl-A D`
    - While viewing running session, make it scrollable with `ctrl-A [`
    - View last session's output: `screen -r -d` -->



## Writing new functionality

When adding new party commands, make sure to verify if it needs an entry in the [documentation](https://github.com/aphased/BingoPartyCommands).

Rule of thumb: If it's using `!p`, it should be added to the documentation repo, especially so if all splashers can use it (but also new commands only for staff-and-up)


### Custom functions/use of aliases

These might have only a single one, or several reasons for their existence.

Either way, for consistency, always **use the following abstractions** rather
than directly going to their underlying implementations:

- If a command has a response/status-like message to return:
  ```js
  bot.reply(sender, message);
  ```
  - (with the full `sender` object)
  - This does several things: reply to the correct person, not reply when the
    sender was using Discord (TODO) or the admin console to send the command
    and finally adding a randomizer string to the message in order to bypass the
    anti-spam limitations of Hypixel chatting.

- If you want to send a message to party chat about the commands action (like
  `Party mute was toggled by Name` for example), use `sender.preferredName`:
  ```js
  bot.chat(`/pc Party mute was toggled by ${sender.preferredName}.`);
  ```
  - This ensures the name that is preferred and/or chosen by users is actually
    taken when producing output which all party members can see.
  - A preferred name is one of the IGN from any of the existing account(s) on
    record for one player.

- If you want to access a command's functionality outside of just defining it in
  the `commands/` directory:
  ```js
  bot.utils.getCommandByAlias(bot, name).execute() …
  ```

- If you want to issue multiple commands to Hypixel via Minecraft chat back to
  back:
  ```js
  await bot.utils.delay(bot.utils.minMsgDelay);
  bot.chat(`/someCommand`);

  await bot.utils.delay(bot.utils.minMsgDelay);
  bot.chat(`/p doSomething ${player}`);
  ```
  - This is necessary as Hypixel demands a pause/wait of at least certain time
    in between messages sent.
  

