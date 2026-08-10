import test from "node:test";
import assert from "node:assert/strict";
import RuntimeEvents from "../src/runtime/RuntimeEvents.mjs";
import { installConsoleBridge } from "../src/runtime/ConsoleBridge.mjs";

test("Console bridge emits log, warn, and error events and restores console methods", () => {
  const events = new RuntimeEvents({ limit: 10 });
  const originalLog = console.log;
  const restore = installConsoleBridge({ events });

  console.log("hello");
  console.warn("warn");
  console.error("error");
  restore();

  assert.equal(console.log, originalLog);
  assert.deepEqual(
    events.getSnapshot().map((event) => [event.level, event.text]),
    [
      ["info", "hello"],
      ["warn", "warn"],
      ["error", "error"],
    ],
  );
});
