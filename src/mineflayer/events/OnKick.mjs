import { WebhookMessageType } from "../../utils/Interfaces.mjs";

function safeSerializeReason(reason) {
  if (typeof reason === "string") return reason;
  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
}

function extractChatText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map((entry) => extractChatText(entry)).join("");
  if (typeof node !== "object") return String(node);

  const textParts = [];

  if (typeof node.text === "string") textParts.push(node.text);
  if (Array.isArray(node.extra)) textParts.push(extractChatText(node.extra));
  if (Array.isArray(node.with) && !textParts.length)
    textParts.push(node.with.map((entry) => extractChatText(entry)).join(" "));

  return textParts.join("").trim();
}

export function normalizeKickReason(reason) {
  const raw = safeSerializeReason(reason);

  if (typeof reason === "string") {
    const trimmed = reason.trim();
    if (!trimmed) return { raw, text: "Unknown reason" };

    try {
      const parsed = JSON.parse(trimmed);
      const extracted = extractChatText(parsed);
      return {
        raw,
        text: extracted || trimmed,
      };
    } catch {
      return {
        raw,
        text: trimmed,
      };
    }
  }

  const extracted = extractChatText(reason);
  return {
    raw,
    text: extracted || raw || "Unknown reason",
  };
}

export default {
  name: "Kick Event",
  description: "The message event stuff",
  /**
   *
   * @param {import("../Bot.mjs").default} bot
   */
  execute: async function (bot, reason, loggedIn) {
    const normalizedReason = normalizeKickReason(reason);
    const duringLogin = loggedIn ? "" : "during login ";
    const suffix =
      normalizedReason.raw && normalizedReason.raw !== normalizedReason.text
        ? ` (${normalizedReason.raw})`
        : "";

    bot.utils.log(
      `Kicked from server ${duringLogin}for reason: ${normalizedReason.text}${suffix}`,
      "Error",
    );
    bot.utils.webhookLogger.addMessage(
      `Kicked from server ${duringLogin}for reason: ${normalizedReason.text}`,
      WebhookMessageType.ActionLog,
      true,
    );
  },
};
