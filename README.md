# BingoPartyBot

Like [BingoPartyTools](https://github.com/aphased/BingoPartyTools?tab=readme-ov-file#all-available-commands),
but instead of being a ChatTriggers mod for a real player's main account to use
with launching a regular instance of Minecraft, this repo enables a dedicated
bot account using [Mineflayer](https://github.com/PrismarineJS/mineflayer),
which can then be provided via e.g. a dedicated server.


## Features (overview)

- All of [BingoPartyTools](https://github.com/aphased/BingoPartyTools?tab=readme-ov-file#all-available-commands
)’
functionality on the user-facing side (see [this separate **Readme for how to use**](https://github.com/aphased/BingoPartyCommands) if
you are a splasher/have party moderation permissions), including commands which
are only accessible to and only work for a predefined group of users
- WIP/TODO: Persistent ban system with support for temporary time-based blocking
- TODO: Hot reloading of player (allowed permissions/banned) data (and perhaps code modules/specific functions or party commands? Probably not needed anymore)
- Admin-only “special access“ commands & usage
- Auto-restart upon program crashes


## Code & module structure

For potential contributors… or myself, when I eventually come back to fix or
extend something:

- Start the bot (in my case on a Linux server) by executing
`./BingoPartyBot/run-bot` in the shell, which will start Node
- In addition to initializing the bot, `index.mjs` enables command input
in-game via the console stdin
- Registering the chat listeners is done in `bot.mjs`
- Chat messages are parsed and acted upon in `modules/handleMessage.mjs`
- After an extra layer of preparing/"sanitizing" messages incl. sender checks
(`modules/handleCommand.mjs`), the "main features", party commands, are implemented and send results out to the game/Hypixel in `sharedCoreFunctionality.mjs`
(_shared_ as this is the part which could be re-used in both
the ChatTriggers and Mineflayer code)
- `boolChecks.mjs` and `utils.mjs` are modules with helper functionality
- data is stored in the `data` directory: `playerNames.json`,
`bingoBrewersRules.json`, and `autokickWords.json` (WIP on `banned.json`)
- `manageData.mjs` to interact with said data (also partially WIP)


## Roadmap

The project is mostly feature-complete and (mostly) bug-free.
I do want to add though, at minimum:

- Addition & removal of IGNs to the allowlist via an in-game command
(e.g. something like `/msg BingoParty !p add splasher:exact_IGN`,
`/msg BingoParty !p add alias:current_IGN new_exact_IGN_1 new_exact_IGN_2`) for Bingo Brewers admins
- Automated git commits & pushes for changes to the data (`playerNames.json`, `banned.json`)
- Automated boot & shutdown on-server at Bingo event start & end dates
- Potentially (?) a ban system with Discord integration, or at the very minimum, time-based
**temporary bans** with optionally given ban reasons stored.


## How to run

If you are a **user** of the BingoParty bot system, you do not need to install
anything (same as with the previous version based on ChatTriggers),
see [the table here](https://github.com/aphased/BingoPartyCommands?tab=readme-ov-file#all-available-commands) on how to use.

If you want to **run** this system yourself, or would like to experiment with
the code, you can:
- `git clone https://github.com/aphased/BingoPartyBot`
- Fill in credentials for authenticating a Minecraft to-be-bot account in a
`.env` file according to the template structure
- Adapt the entry with property `permissionRank: botAccountOwner` to your main account's
Minecraft IGN in `playerNames.json`
- Run `./BingoPartyBot/run-bot` (for Unix, on Windows do
`cd C:\full\path\to\folder\BingoPartyBot && node index.mjs`, which will _not_
restart the bot upon crashes)
    - Add something for (re)starting with more convenience and only needing to remember a single command, for example `alias restartbpb="screen -d -RR bpb $HOME/BingoPartyBot/run-bot"`, to your .{shell}rc file
- Additional things (mostly so I have a place in which to look them up):
    - Until auto-GitHub-repo pulling is implemented, get files onto server with
    `scp -6 -r --exclude='node_modules/' "$HOME/workspace/dir/" 'user@[ipv6-addr]:/home/user/dir'`
    - When SSH'd into server, start a session using e.g. `screen -S bpb ./BingoPartyBot/run-bot`
    so it persists connection resets (see `restartbpb` above)
    - Reconnect to running session: `screen -r bpb`, exit viewing (not _quitting_ the program) with `ctrl-A D`
    - While viewing running session, make it scrollable with `ctrl-A [`


## Credits & thanks

Trypo wrote the initial port to a bot system using Mineflayer.
Massive thanks for kickstarting this idea into a project!

Thanks to ooffyy, BossFlea, p0iS, Calva and all splashers of
[Bingo Brewers](https://discord.gg/bingobrewers)
for suggestions for new and improved features & all the bug-hunting.


## License

BingoPartyBot is open-sourced software licensed under the [MIT License](https://opensource.org/licenses/MIT).
