# TUI User Guide

The terminal UI has three main areas:

- Status bar: current Minecraft connection state, username, verbosity, Discord status, and active filter.
- Event feed: chronological runtime output filtered by source or severity.
- Input area: command entry with four modes shown as `Bot`, `MC`, `Party`, and `System`.

## Modes

- `Bot`: submit bot commands through the existing command parser. Typing `help` here behaves like `!p help`.
- `MC`: send raw Minecraft commands. Input must start with `/`.
- `Party`: send text directly as `/pc <message>`.
- `System`: local runtime actions such as reconnect, disconnect, reload, and filter changes.

Press `Tab` to cycle modes forward and `Shift+Tab` to cycle backward.

## Filters

The top filter row can show:

- `all`
- `minecraft`
- `discord`
- `system`
- `operator`
- `sent`
- `errors`

To change the active filter:

- Press `Left` / `Right`
- Or press `Ctrl+H` / `Ctrl+L`

You can also jump filters from the input box:

1. Press `Tab` until the mode is `System`
2. Run `filter minecraft`, `filter discord`, `filter system`, `filter operator`, `filter sent`, `filter errors`, or `filter all`

This is useful when terminal arrow handling is inconsistent or when you want to jump directly to a specific top tab.

## Scrolling

- `Ctrl+P`: scroll one line older
- `Ctrl+N`: scroll one line newer
- `Ctrl+U`: jump older faster
- `Ctrl+D`: jump newer faster

These shortcuts affect only the event feed and should no longer type letters into the input box.

## Exit

- `Ctrl+C`: open quit confirmation
- `Esc`: cancel quit confirmation
- `Ctrl+C` again: exit
