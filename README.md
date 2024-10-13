# BingoPartyBot

BingoPartyBot provides an automated, easier moderated public party for players
of Hypixel's [Bingo event](https://wiki.hypixel.net/Bingo)
at the start of each month, similar to the previous
[BingoPartyTools](https://github.com/aphased/BingoPartyTools?tab=readme-ov-file#all-available-commands),
but instead of being a ChatTriggers mod for a player's main account, this repo
uses [Mineflayer](https://github.com/PrismarineJS/mineflayer) to create a
dedicated bot account. The bot can then run on a dedicated server to remain
online continuously.

## Features (overview)

- All of [BingoPartyTools](https://github.com/aphased/BingoPartyTools?tab=readme-ov-file#all-available-commands)’
  functionality on the user-facing side (see [this separate **Commands Documentation on how to use**](https://github.com/aphased/BingoPartyCommands)
  if you are a splasher/have party moderation permissions), including commands
  which are only accessible to and only work for a predefined group of users
- WIP/TODO: Persistent ban system with support for temporary time-based blocking
- Hot reloading of player (allowed permissions/TODO: banned) data and code
  modules/specific party commands, too
- Minecraft UUID and IGN based commands allowlist with support for multiple ("alt") accounts for each player
- Admin-only “special access“ commands & usage, e.g. for adding new users with their permission level to the allowlist so they can execute party commands, all available using custom in-game commands
- Auto-restart upon program crashes
- Discord integration for:
  - Reading the party chat in channels, writing to it (WIP), and monitoring
    who joins/leaves/is kicked from the party or goes offline as well as slash
    commands
  - Easy-to-use, custom, simple mechanic for linking in-game records with
    Discord accounts
  - Automatically retrieving a link to the current month's Bingo guide on the
    [Hypixel forums](https://hypixel.net/search/16635725/?t=post&c[content]=thread&c[users]=IndigoPolecat&o=date)
    to post it into the party chat on request
- Bot account that detects presence outside of limbo world/at most a lobby area
  and re-`/limbo`s in response
- … and more!

## Code strucure, how to run, etc.

Please see [`CONTRIBUTING.md`](./CONTRIBUTING.md).


## Roadmap

The project is fairly feature-complete and (mostly) bug-free by now.
I do want to add though, at minimum:

- Fix re-launching on crash, i.e. de-coupling of node process running vs. the
  Minecraft bot account being logged in on hypixel.net
- Automated git commits & pushes for changes to the data
  (`playerNames.json`, `banned.json`)
- Automated boot & shutdown on-server at Bingo event start & end dates
- _Probably_ a ban system with Discord integration, or at the very minimum,
  time-based **temporary bans** with optionally given ban reasons (DONE) &
  expirations stored across relaunches.

## Credits & thanks

Trypo wrote the initial port to a bot system using Mineflayer.
Massive thanks for kickstarting this idea into a project!

Thanks to ooffyy, BossFlea, p0iS, Calva, jbaNate and all splashers of
[Bingo Brewers](https://discord.gg/bingobrewers) for suggestions and/or code
contributions for new and improved features & all the bug-hunting.

Thanks to Conutik for giving this project a much-needed thorough rewrite and overhaul!

## License

BingoPartyBot is open-sourced software licensed under the [MIT License](https://opensource.org/licenses/MIT).
