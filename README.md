# BingoPartyBot

<!-- Like [BingoPartyTools](https://github.com/aphased/BingoPartyTools?tab=readme-ov-file#all-available-commands),
but instead of being a ChatTriggers mod for a real player's main account to use
when launching a regular instance of Minecraft, this repo enables a dedicated
bot account using [Mineflayer](https://github.com/PrismarineJS/mineflayer),
which can then be provided via e.g. a dedicated server in order to be always
online. -->

Similar to [BingoPartyTools](https://github.com/aphased/BingoPartyTools?tab=readme-ov-file#all-available-commands),
but instead of being a ChatTriggers mod for a player's main account, this repo
uses [Mineflayer](https://github.com/PrismarineJS/mineflayer) to create a
dedicated bot account. The bot can then run on a dedicated server to remain
online continuously.

## Features (overview)

- All of [BingoPartyTools](https://github.com/aphased/BingoPartyTools?tab=readme-ov-file#all-available-commands)’
  functionality on the user-facing side (see [this separate **Readme for how to use**](https://github.com/aphased/BingoPartyCommands)
  if you are a splasher/have party moderation permissions), including commands
  which are only accessible to and only work for a predefined group of users
- WIP/TODO: Persistent ban system with support for temporary time-based blocking
- Hot reloading of player (allowed permissions/TODO: banned) data and code
  modules/specific party commands, too
- Admin-only “special access“ commands & usage
- Auto-restart upon program crashes
- Discord integration for reading the party chat, writing to it (WIP), and
  monitoring who joins/leaves/is kicked from the party or goes offline as well
  as slash commands

## Code & module structure

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

- TODO: update this section with some explanations. For now, a handy list of files:

<!-- (generated from !`tree -I node_modules` then auto-inserted in Helix) -->

```tree
.
├── Config.example.mjs
├── Config.mjs
├── README.md
├── convert-data-util.mjs
├── data
│   ├── autoKickWords.json
│   ├── banned.json
│   ├── bingoBrewersRules.json
│   ├── generalDatabase.json
│   ├── playerNames.json
│   ├── playerNamesOld.json
│   ├── playerNamesOldFormat.json
│   └── playerNamesUpdatedFormat.json
├── index.mjs
├── package-lock.json
├── package.json
├── run-bot
└── src
    ├── discord
    │   ├── Discord.mjs
    │   ├── components
    │   │   └── commands
    │   │       ├── ExampleCommand.mjs
    │   │       ├── Guide.mjs
    │   │       └── Link.mjs
    │   ├── handlers
    │   │   └── CommandHandler.mjs
    │   └── old.mjs
    ├── mineflayer
    │   ├── Bot.mjs
    │   ├── commands
    │   │   ├── EXAMPLECOMMAND.mjs
    │   │   ├── admin
    │   │   │   ├── AddUser.mjs
    │   │   │   ├── Cmd.mjs
    │   │   │   ├── DisableCommands.mjs
    │   │   │   ├── EnableCommands.mjs
    │   │   │   ├── GetUser.mjs
    │   │   │   ├── Limbo.mjs
    │   │   │   ├── PreferredName.mjs
    │   │   │   ├── ReloadCommands.mjs
    │   │   │   ├── RemoveUser.mjs
    │   │   │   └── Sudo.mjs
    │   │   ├── misc
    │   │   │   ├── Help.mjs
    │   │   │   └── Link.mjs
    │   │   ├── party
    │   │   │   ├── AllInvite.mjs
    │   │   │   ├── Ban.mjs
    │   │   │   ├── Close.mjs
    │   │   │   ├── CustomRepeat.mjs
    │   │   │   ├── Disband.mjs
    │   │   │   ├── Guide.mjs
    │   │   │   ├── Invite.mjs
    │   │   │   ├── Kick.mjs
    │   │   │   ├── KickOffline.mjs
    │   │   │   ├── Mute.mjs
    │   │   │   ├── Poll.mjs
    │   │   │   ├── Promote.mjs
    │   │   │   ├── Repeat.mjs
    │   │   │   ├── Rule.mjs
    │   │   │   ├── Say.mjs
    │   │   │   ├── Stream.mjs
    │   │   │   ├── Transfer.mjs
    │   │   │   └── Unban.mjs
    │   │   └── sudo
    │   │       └── Drain.mjs
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

## How to run

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
- Duplicate the file `Config.example.mjs` and rename it to `Config.mjs`. Then,
  fill out the values for your bot Minecraft account's Microsoft email, and
  optionally the values needed for Discord integration.
- TODO: mention a new/empty database and adding a new bot owner entry

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

- Execute `npm install` in your command line to get the dependencies installed
- Run `./BingoPartyBot/run-bot` for Unix (Linux/macOS/…), on Windows you can
execute the `run-bot.bat` file (which will however _not_ restart the bot upon crashes)
– or just `node .`, which will also not restart on crash, but works everywhere - Add something for (re)starting with more convenience and only needing to
remember a single command to to your .{shell}rc config file, for example
using `screen`: `alias restartbpb="screen -d -RR bpb $HOME/BingoPartyBot/run-bot"`
<!-- - Additional things (mostly so I have a place in which to look them up):
    - When SSH'd into the server, start a session using e.g. `screen -S bpb ./BingoPartyBot/run-bot`
    so that it persists connection resets (see `restartbpb` command alias above)
    - Reconnect to running session: `screen -r bpb`, exit viewing (not _quitting_ the program) with `ctrl-A D`
    - While viewing running session, make it scrollable with `ctrl-A [`
    - View last session's output: `screen -r -d` -->

## Roadmap

The project is fairly feature-complete and (mostly) bug-free.
I do want to add though, at minimum:

- Make bot account detect presence outside of limbo/at most lobby areas and
  re-`/limbo` in response
- Fix re-launching on crash, i.e. de-coupling of node process running vs. the
  Minecraft bot account being logged in on hypixel.net
- Addition & removal of IGNs to the allowlist via an in-game command
  (e.g. something like `/msg BingoParty !p add splasher:exact_IGN`,
  `/msg BingoParty !p add alias:current_IGN new_exact_IGN_1 new_exact_IGN_2`,
  `/msg BingoParty !p removeSplasher primary_IGN`) for Bingo Brewers staff/admins
  - Partially automate this process by regularly checking all encountered IGNs'
    associated account UUIDs to see if any name changes have been made, and
    adapt data entries accordingly
- Automated git commits & pushes for changes to the data
  (`playerNames.json`, `banned.json`)
- Automated boot & shutdown on-server at Bingo event start & end dates
- Potentially (?) a ban system with Discord integration, or at the very minimum,
  time-based **temporary bans** with optionally given ban reasons & expirations
  stored across relaunches.

## Credits & thanks

Trypo wrote the initial port to a bot system using Mineflayer.
Massive thanks for kickstarting this idea into a project!

Thanks to ooffyy, BossFlea, p0iS, Calva, jbaNate and all splashers of
[Bingo Brewers](https://discord.gg/bingobrewers)
for suggestions for new and improved features & all the bug-hunting.

Thanks to Conutik for giving this project a much-needed thorough rewrite and overhaul!

## License

BingoPartyBot is open-sourced software licensed under the [MIT License](https://opensource.org/licenses/MIT).
