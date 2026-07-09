import test from "node:test";
import assert from "node:assert/strict";
import OperatorCommands from "../src/runtime/OperatorCommands.mjs";
import RuntimeEvents from "../src/runtime/RuntimeEvents.mjs";

function createFakeBot() {
  const calls = {
    chat: [],
    messages: [],
    reconnects: 0,
    disconnects: 0,
    reloads: 0,
  };

  return {
    calls,
    config: {
      partyCommandPrefix: "!p",
    },
    getUsername() {
      return "BingoParty";
    },
    chat(message) {
      calls.chat.push(message);
    },
    async onMessage(message) {
      calls.messages.push(message.toString());
    },
    connect() {
      calls.reconnects += 1;
    },
    disconnect() {
      calls.disconnects += 1;
    },
    async reloadPartyCommands() {
      calls.reloads += 1;
    },
  };
}

test("OperatorCommands sends raw minecraft commands", async () => {
  const events = new RuntimeEvents({ limit: 10 });
  const bot = createFakeBot();
  const commands = new OperatorCommands({ minecraftBot: bot, events });

  const result = await commands.submitOperatorInput({
    mode: "minecraft-command",
    text: "/locraw",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(bot.calls.chat, ["/locraw"]);
});

test("OperatorCommands rejects minecraft commands without slash", async () => {
  const commands = new OperatorCommands({
    minecraftBot: createFakeBot(),
    events: new RuntimeEvents({ limit: 10 }),
  });

  const result = await commands.submitOperatorInput({
    mode: "minecraft-command",
    text: "locraw",
  });

  assert.equal(result.ok, false);
});

test("OperatorCommands routes bot-command input through the custom message path", async () => {
  const bot = createFakeBot();
  const commands = new OperatorCommands({
    minecraftBot: bot,
    events: new RuntimeEvents({ limit: 10 }),
  });

  const result = await commands.submitOperatorInput({
    mode: "bot-command",
    text: "help",
  });

  assert.equal(result.ok, true);
  assert.equal(bot.calls.messages[0].includes("!p help"), true);
});

test("OperatorCommands sends explicit party chat", async () => {
  const bot = createFakeBot();
  const commands = new OperatorCommands({
    minecraftBot: bot,
    events: new RuntimeEvents({ limit: 10 }),
  });

  const result = await commands.submitOperatorInput({
    mode: "party-chat",
    text: "hello party",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(bot.calls.chat, ["/pc hello party"]);
});

test("OperatorCommands rejects empty input", async () => {
  const commands = new OperatorCommands({
    minecraftBot: createFakeBot(),
    events: new RuntimeEvents({ limit: 10 }),
  });

  const result = await commands.submitOperatorInput({
    mode: "party-chat",
    text: "",
  });

  assert.equal(result.ok, false);
});

test("OperatorCommands handles system actions and filter callbacks", async () => {
  let filter = "all";
  const bot = createFakeBot();
  const commands = new OperatorCommands({
    minecraftBot: bot,
    events: new RuntimeEvents({ limit: 10 }),
    actionHandlers: {
      setFilter(nextFilter) {
        filter = nextFilter;
        return true;
      },
    },
  });

  await commands.submitOperatorInput({
    mode: "system-action",
    text: "reconnect",
  });
  await commands.submitOperatorInput({
    mode: "system-action",
    text: "disconnect",
  });
  await commands.submitOperatorInput({
    mode: "system-action",
    text: "reload-commands",
  });
  await commands.submitOperatorInput({
    mode: "system-action",
    text: "filter sent",
  });

  assert.equal(bot.calls.reconnects, 1);
  assert.equal(bot.calls.disconnects, 1);
  assert.equal(bot.calls.reloads, 1);
  assert.equal(filter, "sent");
});
