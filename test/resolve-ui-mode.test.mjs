import test from "node:test";
import assert from "node:assert/strict";
import resolveUiMode from "../src/runtime/resolveUiMode.mjs";

test("resolveUiMode prefers explicit CLI flags", () => {
  assert.equal(
    resolveUiMode({
      argv: ["--tui"],
      env: {},
      stdinIsTTY: false,
      stdoutIsTTY: false,
    }),
    "tui",
  );
  assert.equal(
    resolveUiMode({
      argv: ["--no-tui"],
      env: { BPB_TUI: "1" },
      stdinIsTTY: true,
      stdoutIsTTY: true,
    }),
    "headless",
  );
});

test("resolveUiMode uses env when CLI flags are absent", () => {
  assert.equal(
    resolveUiMode({
      argv: [],
      env: { BPB_TUI: "1" },
      stdinIsTTY: false,
      stdoutIsTTY: false,
    }),
    "tui",
  );
  assert.equal(
    resolveUiMode({
      argv: [],
      env: { BPB_TUI: "0" },
      stdinIsTTY: true,
      stdoutIsTTY: true,
    }),
    "headless",
  );
});

test("resolveUiMode falls back to TTY detection", () => {
  assert.equal(
    resolveUiMode({
      argv: [],
      env: {},
      stdinIsTTY: true,
      stdoutIsTTY: true,
    }),
    "tui",
  );
  assert.equal(
    resolveUiMode({
      argv: [],
      env: {},
      stdinIsTTY: true,
      stdoutIsTTY: false,
    }),
    "headless",
  );
});
