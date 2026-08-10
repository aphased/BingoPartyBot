import test from "node:test";
import assert from "node:assert/strict";
import onKickEvent, {
  normalizeKickReason,
} from "../src/mineflayer/events/OnKick.mjs";

test("normalizeKickReason handles protocol chat-component objects", () => {
  const normalized = normalizeKickReason({
    extra: [{ text: "You are already logged in!" }],
  });

  assert.equal(normalized.text, "You are already logged in!");
  assert.equal(
    normalized.raw,
    JSON.stringify({ extra: [{ text: "You are already logged in!" }] }),
  );
});

test("normalizeKickReason handles typed NBT-style reason objects", () => {
  const normalized = normalizeKickReason({
    type: "compound",
    value: {
      extra: {
        type: "list",
        value: {
          type: "compound",
          value: [
            {
              color: {
                type: "string",
                value: "red",
              },
              text: {
                type: "string",
                value: "Mojang's session servers are currently offline. Try again later.",
              },
            },
          ],
        },
      },
      text: {
        type: "string",
        value: "",
      },
    },
  });

  assert.equal(
    normalized.text,
    "Mojang's session servers are currently offline. Try again later.",
  );
});

test("normalizeKickReason handles JSON strings and plain strings", () => {
  assert.equal(
    normalizeKickReason('{"extra":[{"text":"Disconnected"}]}').text,
    "Disconnected",
  );
  assert.equal(normalizeKickReason("Disconnected").text, "Disconnected");
});


test("OnKick logs without throwing for object reasons", async () => {
  const messages = [];
  const webhookMessages = [];
  const bot = {
    utils: {
      log(message, type) {
        messages.push({ message, type });
      },
      webhookLogger: {
        addMessage(message, type) {
          webhookMessages.push({ message, type });
        },
      },
    },
  };

  await onKickEvent.execute(
    bot,
    { extra: [{ text: "You are already logged in!" }] },
    true,
  );

  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, "Error");
  assert.equal(
    messages[0].message.includes("You are already logged in!"),
    true,
  );
  assert.equal(webhookMessages.length, 1);
});
