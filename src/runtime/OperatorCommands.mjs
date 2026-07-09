import Utils from "../utils/Utils.mjs";

export const OPERATOR_MODES = Object.freeze([
  "bot-command",
  "minecraft-command",
  "party-chat",
  "system-action",
]);

function formatConsoleSender(bot, message) {
  return new Utils.CustomMessage(
    `\u001b[35mFrom \u001b[31m[CONSOLE] ${bot?.getUsername?.() ?? "BingoParty"}\u001b[37m: ${message}\u001b[0m`,
  );
}

export default class OperatorCommands {
  constructor({ minecraftBot, utils, events, actionHandlers = {} } = {}) {
    this.minecraftBot = minecraftBot;
    this.utils = utils;
    this.events = events;
    this.actionHandlers = { ...actionHandlers };
  }

  setActionHandlers(actionHandlers = {}) {
    this.actionHandlers = { ...this.actionHandlers, ...actionHandlers };
  }

  emitEvent(event) {
    return this.events?.emit(event);
  }

  normalizeText(text) {
    return String(text ?? "").trim();
  }

  async submitLegacyConsoleInput(text) {
    const normalized = this.normalizeText(text);
    if (!normalized)
      return this.invalidResult("Console input cannot be empty.", {
        mode: "legacy",
      });
    if (normalized.startsWith("/"))
      return this.submitOperatorInput({
        mode: "minecraft-command",
        text: normalized,
      });
    if (
      normalized.startsWith(this.minecraftBot?.config?.partyCommandPrefix ?? "!p")
    )
      return this.submitOperatorInput({
        mode: "bot-command",
        text: normalized,
      });
    if (normalized.startsWith("!dc"))
      return {
        ok: true,
        ignored: true,
        message: "Discord console commands are not implemented.",
      };
    return this.invalidResult(
      "Unsupported console input. Use / for raw commands or the bot command prefix.",
      { mode: "legacy" },
    );
  }

  invalidResult(message, metadata = {}) {
    const event = this.emitEvent({
      source: "operator",
      kind: "error",
      level: "warn",
      text: message,
      metadata,
    });
    return {
      ok: false,
      message,
      eventId: event?.id,
    };
  }

  successResult(message, metadata = {}) {
    const event = this.emitEvent({
      source: "operator",
      kind: "command",
      level: "info",
      text: message,
      metadata,
    });
    return {
      ok: true,
      message,
      eventId: event?.id,
    };
  }

  async submitOperatorInput({ mode, text }) {
    const normalizedMode = OPERATOR_MODES.includes(mode) ? mode : "bot-command";
    const normalizedText = this.normalizeText(text);

    if (!normalizedText)
      return this.invalidResult("Input cannot be empty.", {
        mode: normalizedMode,
      });

    switch (normalizedMode) {
      case "minecraft-command":
        return this.submitMinecraftCommand(normalizedText);
      case "party-chat":
        return this.submitPartyChat(normalizedText);
      case "system-action":
        return this.submitSystemAction(normalizedText);
      case "bot-command":
      default:
        return this.submitBotCommand(normalizedText);
    }
  }

  async submitMinecraftCommand(text) {
    if (!text.startsWith("/"))
      return this.invalidResult(
        "Minecraft commands must start with '/'.",
        { mode: "minecraft-command" },
      );
    this.minecraftBot?.chat(text);
    return this.successResult(`Sent Minecraft command: ${text}`, {
      mode: "minecraft-command",
      direction: "outbound",
      command: text,
    });
  }

  async submitPartyChat(text) {
    this.minecraftBot?.chat(`/pc ${text}`);
    return this.successResult(`Sent party chat: ${text}`, {
      mode: "party-chat",
      direction: "outbound",
      command: `/pc ${text}`,
    });
  }

  async submitBotCommand(text) {
    if (!this.minecraftBot?.onMessage)
      return this.invalidResult("Minecraft bot is not available.", {
        mode: "bot-command",
      });

    const prefix = this.minecraftBot.config?.partyCommandPrefix ?? "!p";
    const normalizedCommand =
      text.startsWith(prefix) || text.startsWith("/")
        ? text
        : `${prefix} ${text}`;

    await this.minecraftBot.onMessage(
      formatConsoleSender(this.minecraftBot, normalizedCommand),
    );
    return this.successResult(`Submitted bot command: ${normalizedCommand}`, {
      mode: "bot-command",
      direction: "outbound",
      command: normalizedCommand,
    });
  }

  async submitSystemAction(text) {
    const normalized = text.toLowerCase();

    if (normalized === "reconnect") {
      this.minecraftBot?.connect({
        immediate: true,
        reason: "Reconnect requested from operator UI",
      });
      return this.successResult("Reconnect requested.", {
        mode: "system-action",
        action: "reconnect",
      });
    }

    if (normalized === "disconnect") {
      this.minecraftBot?.disconnect("Disconnect requested from operator UI");
      return this.successResult("Disconnect requested.", {
        mode: "system-action",
        action: "disconnect",
      });
    }

    if (normalized === "reload-commands") {
      await this.minecraftBot?.reloadPartyCommands?.();
      return this.successResult("Party commands reloaded.", {
        mode: "system-action",
        action: "reload-commands",
      });
    }

    if (normalized.startsWith("filter ")) {
      const filter = text.slice("filter ".length).trim().toLowerCase();
      const result = this.actionHandlers.setFilter?.(filter);
      if (result === false)
        return this.invalidResult(`Unknown filter: ${filter}`, {
          mode: "system-action",
          action: "filter",
        });
      return this.successResult(`Active filter set to ${filter}.`, {
        mode: "system-action",
        action: "filter",
        filter,
      });
    }

    return this.invalidResult(
      "Unknown system action. Use reconnect, disconnect, reload-commands, or filter <name>.",
      { mode: "system-action" },
    );
  }
}
