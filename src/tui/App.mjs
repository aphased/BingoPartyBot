import React, { useEffect, useState } from "react";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";
import TextInput from "ink-text-input";
import { FILTER_PRESETS } from "../runtime/RuntimeEvents.mjs";
import { OPERATOR_MODES } from "../runtime/OperatorCommands.mjs";

const h = React.createElement;

const FILTER_OPTIONS = Object.freeze([
  "all",
  "minecraft",
  "discord",
  "system",
  "operator",
  "sent",
  "errors",
]);

const MODE_LABELS = Object.freeze({
  "bot-command": "Bot",
  "minecraft-command": "MC",
  "party-chat": "Party",
  "system-action": "System",
});

const MODE_HINTS = Object.freeze({
  "bot-command": "Command without prefix is accepted",
  "minecraft-command": "Starts with /",
  "party-chat": "Sends /pc <text>",
  "system-action": "reconnect | disconnect | reload-commands | filter <name>",
});

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-GB", {
    hour12: false,
  });
}

function getEventColor(event) {
  if (event.level === "error") return "red";
  if (event.level === "warn") return "yellow";
  switch (event.source) {
    case "minecraft":
      return "green";
    case "discord":
      return "blue";
    case "operator":
      return "magenta";
    default:
      return "white";
  }
}

function normalizeFilter(filter) {
  return FILTER_OPTIONS.includes(filter) ? filter : "all";
}

function renderBadge(text, { selected = false, color = "gray", key } = {}) {
  return h(
    Box,
    { key, marginRight: 1 },
    h(
      Text,
      {
        backgroundColor: selected ? color : undefined,
        color: selected ? "black" : color,
      },
      selected ? ` ${text} ` : `[${text}]`,
    ),
  );
}

function renderEventLine(event, showTimestamps) {
  const sourceLabel = event.source.toUpperCase();
  const prefix = showTimestamps
    ? `${formatTimestamp(event.timestamp)} ${sourceLabel}`
    : sourceLabel;
  return h(
    Box,
    { key: event.id },
    h(
      Text,
      { color: getEventColor(event) },
      `${prefix} ${event.text}`,
    ),
  );
}

export default function App({ runtime }) {
  const { exit } = useApp();
  const { rows: terminalRows = 24 } = useWindowSize();
  const [snapshot, setSnapshot] = useState(runtime.getSnapshot());
  const [inputValue, setInputValue] = useState("");
  const [modeIndex, setModeIndex] = useState(0);
  const [filter, setFilter] = useState("all");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeMode = OPERATOR_MODES[modeIndex] ?? OPERATOR_MODES[0];
  const normalizedFilter = normalizeFilter(filter);
  const feedHeight = Math.max(6, terminalRows - 8);
  const filteredEvents = runtime.events.getSnapshot(normalizedFilter);
  const sliceEnd =
    scrollOffset > 0
      ? Math.max(0, filteredEvents.length - scrollOffset)
      : filteredEvents.length;
  const visibleEvents = filteredEvents.slice(
    Math.max(0, sliceEnd - feedHeight),
    sliceEnd,
  );

  useEffect(() => {
    const unsubscribe = runtime.events.subscribe(() => {
      setSnapshot(runtime.getSnapshot());
    });
    const interval = setInterval(() => {
      setSnapshot(runtime.getSnapshot());
    }, 1000);
    runtime.commands.setActionHandlers({
      setFilter(nextFilter) {
        if (!FILTER_OPTIONS.includes(nextFilter)) return false;
        setFilter(nextFilter);
        return true;
      },
    });
    return () => {
      clearInterval(interval);
      unsubscribe();
      runtime.commands.setActionHandlers({
        setFilter: undefined,
      });
    };
  }, [runtime]);

  useInput((input, key) => {
    if (submitting) return;

    if (key.ctrl && input === "c") {
      if (confirmExit) {
        void runtime.shutdown("Shutdown requested from TUI").finally(exit);
        return;
      }
      setConfirmExit(true);
      return;
    }

    if (key.escape) {
      setConfirmExit(false);
      return;
    }

    if (key.tab) {
      setModeIndex((current) => (current + 1) % OPERATOR_MODES.length);
      return;
    }

    if (key.ctrl && input === "p") {
      setScrollOffset((current) =>
        Math.min(filteredEvents.length, current + 1),
      );
      return;
    }

    if (key.ctrl && input === "n") {
      setScrollOffset((current) => Math.max(0, current - 1));
      return;
    }

    if (key.ctrl && input === "u") {
      setScrollOffset((current) =>
        Math.min(filteredEvents.length, current + 5),
      );
      return;
    }

    if (key.ctrl && input === "d") {
      setScrollOffset((current) => Math.max(0, current - 5));
      return;
    }

    if (key.ctrl && key.leftArrow) {
      setFilter((current) => {
        const index = FILTER_OPTIONS.indexOf(current);
        return FILTER_OPTIONS[
          (index - 1 + FILTER_OPTIONS.length) % FILTER_OPTIONS.length
        ];
      });
      return;
    }

    if (key.ctrl && key.rightArrow) {
      setFilter((current) => {
        const index = FILTER_OPTIONS.indexOf(current);
        return FILTER_OPTIONS[(index + 1) % FILTER_OPTIONS.length];
      });
    }
  });

  async function handleSubmit(value) {
    setSubmitting(true);
    setConfirmExit(false);
    try {
      await runtime.commands.submitOperatorInput({
        mode: activeMode,
        text: value,
      });
      setInputValue("");
      setScrollOffset(0);
      setSnapshot(runtime.getSnapshot());
    } finally {
      setSubmitting(false);
    }
  }

  const showTimestamps = snapshot.config?.tui?.showTimestamps ?? true;
  const minecraftState = snapshot.minecraft;
  const discordState = snapshot.discord;

  return h(
    Box,
    { flexDirection: "column", paddingX: 1 },
    h(
      Box,
      { marginBottom: 1 },
      h(
        Text,
        { bold: true, color: minecraftState.connected ? "green" : "yellow" },
        `Minecraft: ${
          minecraftState.connected
            ? "connected"
            : minecraftState.connecting
              ? "connecting"
              : minecraftState.reconnecting
                ? "reconnecting"
                : "offline"
        }`,
      ),
      h(Text, null, `  User: ${minecraftState.username}`),
      h(Text, null, `  Verbosity: ${minecraftState.verbosityLevel}`),
      h(
        Text,
        {
          color: discordState.enabled ? (discordState.ready ? "green" : "yellow") : "gray",
        },
        `  Discord: ${discordState.enabled ? (discordState.ready ? "ready" : "starting") : "disabled"}`,
      ),
      h(Text, null, `  Filter: ${normalizedFilter}`),
    ),
    h(
      Box,
      { marginBottom: 1 },
      FILTER_OPTIONS.map((option) =>
        renderBadge(option, {
          key: option,
          selected: option === normalizedFilter,
          color: option === "errors" ? "yellow" : "cyan",
        }),
      ),
    ),
    h(
      Box,
      { borderStyle: "round", flexDirection: "column", paddingX: 1, flexGrow: 1 },
      visibleEvents.length
        ? visibleEvents.map((event) => renderEventLine(event, showTimestamps))
        : h(Text, { color: "gray" }, "No events for the current filter."),
    ),
    h(
      Box,
      { marginTop: 1 },
      OPERATOR_MODES.map((mode) =>
        renderBadge(MODE_LABELS[mode], {
          key: mode,
          selected: mode === activeMode,
          color:
            mode === "minecraft-command"
              ? "red"
              : mode === "party-chat"
                ? "green"
                : mode === "system-action"
                  ? "yellow"
                  : "magenta",
        }),
      ),
    ),
    h(
      Box,
      { marginTop: 1, borderStyle: "round", paddingX: 1 },
      h(Text, { color: "gray" }, `${MODE_HINTS[activeMode]}  `),
      h(TextInput, {
        value: inputValue,
        onChange: setInputValue,
        onSubmit: handleSubmit,
        placeholder: "Type command and press Enter",
      }),
    ),
    h(
      Box,
      { marginTop: 1 },
      h(
        Text,
        { color: confirmExit ? "yellow" : "gray" },
        confirmExit
          ? "Press Ctrl+C again to quit, or Esc to cancel."
          : "Tab mode  Ctrl+Left/Right filter  Ctrl+P/N scroll  Ctrl+U/D jump  Ctrl+C quit",
      ),
    ),
  );
}
