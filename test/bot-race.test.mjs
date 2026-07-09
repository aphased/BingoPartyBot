import test from "node:test";
import assert from "node:assert/strict";
import myBot from "../src/mineflayer/Bot.mjs";

test("onSpawn ignores stale bot instances after disconnect", async () => {
  const originalBot = myBot.bot;
  const originalUtils = myBot.utils;

  const calls = [];
  const staleBot = {
    chat(message) {
      calls.push(message);
    },
  };

  myBot.bot = staleBot;
  myBot.utils = {
    delay: async () => {},
  };

  const pending = myBot.onSpawn();
  myBot.bot = null;
  await pending;

  assert.deepEqual(calls, []);

  myBot.bot = originalBot;
  myBot.utils = originalUtils;
});
