import test from "node:test";
import assert from "node:assert/strict";
import RuntimeEvents from "../src/runtime/RuntimeEvents.mjs";

test("RuntimeEvents keeps only the configured ring buffer size", () => {
  const events = new RuntimeEvents({ limit: 2 });
  events.emit({ text: "one" });
  events.emit({ text: "two" });
  events.emit({ text: "three" });

  assert.deepEqual(
    events.getSnapshot().map((event) => event.text),
    ["two", "three"],
  );
});

test("RuntimeEvents filters event snapshots by preset", () => {
  const events = new RuntimeEvents({ limit: 10 });
  events.emit({ source: "minecraft", level: "info", text: "mc" });
  events.emit({ source: "system", level: "warn", text: "warn" });

  assert.equal(events.getSnapshot("minecraft").length, 1);
  assert.equal(events.getSnapshot("errors")[0].text, "warn");
});

test("RuntimeEvents preserves insertion order", () => {
  const events = new RuntimeEvents({ limit: 10 });
  const first = events.emit({ text: "first" });
  const second = events.emit({ text: "second" });

  assert.deepEqual(events.getSnapshot().map((event) => event.id), [
    first.id,
    second.id,
  ]);
});
