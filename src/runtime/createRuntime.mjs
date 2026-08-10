"use strict";

import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import JSONdb from "simple-json-db";
import BaseConfig from "../../Config.mjs";
import { utils, configureRuntimeLogger } from "../utils/Utils.mjs";
import RuntimeEvents from "./RuntimeEvents.mjs";
import OperatorCommands from "./OperatorCommands.mjs";
import { installConsoleBridge } from "./ConsoleBridge.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");

function createHeadlessMirror(events, originalConsole = console) {
  return events.subscribe((event) => {
    if (event.source === "system") return;
    const line = event.ansiText ?? `[${event.source}] ${event.text}`;
    if (event.level === "error") originalConsole.error(line);
    else if (event.level === "warn") originalConsole.warn(line);
    else originalConsole.log(line);
  });
}

export default async function createRuntime({
  uiMode = "headless",
  config = BaseConfig,
} = {}) {
  const runtimeEvents = new RuntimeEvents({
    limit: config.tui?.scrollback ?? 1000,
  });

  const restoreConsole =
    uiMode === "tui"
      ? installConsoleBridge({
          events: runtimeEvents,
          mirrorToConsole: false,
        })
      : null;

  configureRuntimeLogger({
    runtimeEvents: uiMode === "tui" ? runtimeEvents : null,
  });

  const playerNamesDatabase = new JSONdb(path.resolve(ROOT_DIR, "./data/playerNames.json"));
  const generalDatabase = new JSONdb(
    path.resolve(ROOT_DIR, "./data/generalDatabase.json"),
  );

  utils.setPlayerNameDatabase(playerNamesDatabase);
  utils.setGeneralDatabase(generalDatabase);
  utils.setDebug(config.debug.general);
  utils.setRuntimeEvents(runtimeEvents);

  const headlessMirrorCleanup =
    uiMode === "headless" ? createHeadlessMirror(runtimeEvents) : null;

  let minecraftBot = null;
  if (config.debug.disableMinecraft) {
    utils.log("Minecraft bot disabled", "Info");
  } else {
    const module = await import("../mineflayer/Bot.mjs");
    minecraftBot = module.default;
    minecraftBot.setUtilClass(utils);
    minecraftBot.setRuntimeEvents?.(runtimeEvents);
    await minecraftBot.loadCommands();
    minecraftBot.setConfig(config);
  }

  let discordBot = null;
  if (config.debug.disableDiscord) {
    utils.log("Discord bot disabled", "Info");
  } else {
    const module = await import("../discord/Discord.mjs");
    discordBot = module.default;
    discordBot.setUtils(utils);
    discordBot.setConfig(config);
  }

  const commands = new OperatorCommands({
    minecraftBot,
    utils,
    events: runtimeEvents,
  });

  const refreshInterval = setInterval(async () => {
    try {
      const configModule = await import(`../../Config.mjs?cacheBust=${Date.now()}`);
      const nextConfig = configModule.default;
      utils.setDebug(nextConfig.debug.general);
      if (minecraftBot && !config.debug.disableMinecraft)
        minecraftBot.setConfig(nextConfig);
      if (discordBot && !config.debug.disableDiscord)
        discordBot.setConfig(nextConfig);
    } catch (error) {
      utils.log(
        `Error refreshing config: ${error?.stack ?? error?.message ?? error}`,
        "Error",
      );
    }
  }, 10000);
  refreshInterval.unref?.();

  let isShuttingDown = false;
  const runtime = {
    uiMode,
    utils,
    minecraftBot,
    discordBot,
    events: runtimeEvents,
    commands,
    getSnapshot() {
      return {
        config:
          minecraftBot?.config ??
          discordBot?.config ??
          config,
        minecraft: minecraftBot?.getStatusSnapshot?.() ?? {
          enabled: false,
          connected: false,
          connecting: false,
          reconnecting: false,
          username: "BingoParty",
          verbosityLevel: config.verbosityMc,
        },
        discord: discordBot?.getStatusSnapshot?.() ?? {
          enabled: !config.debug.disableDiscord,
          ready: false,
          disabled: true,
        },
        recentEvents: runtimeEvents.getSnapshot(),
      };
    },
    async shutdown(reason = "Shutdown requested") {
      if (isShuttingDown) return;
      isShuttingDown = true;

      clearInterval(refreshInterval);
      headlessMirrorCleanup?.();

      try {
        minecraftBot?.disconnect?.(reason);
      } catch (error) {
        utils.log(
          `Error while disconnecting Minecraft bot: ${error?.stack ?? error}`,
          "Error",
        );
      }

      try {
        await discordBot?.shutdown?.(reason);
      } catch (error) {
        utils.log(
          `Error while shutting down Discord bot: ${error?.stack ?? error}`,
          "Error",
        );
      }

      restoreConsole?.();
      configureRuntimeLogger({ runtimeEvents: null });
    },
  };

  return runtime;
}
