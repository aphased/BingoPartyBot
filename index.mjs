"use strict";

import createRuntime from "./src/runtime/createRuntime.mjs";
import resolveUiMode from "./src/runtime/resolveUiMode.mjs";
import renderTui from "./src/tui/renderTui.mjs";

const uiMode = resolveUiMode();
const runtime = await createRuntime({ uiMode });

async function shutdownAndExit(reason = "Shutdown requested", code = 0) {
  await runtime.shutdown(reason);
  process.exit(code);
}

process.once("SIGINT", () => {
  void shutdownAndExit("Received SIGINT", 0);
});

process.once("SIGTERM", () => {
  void shutdownAndExit("Received SIGTERM", 0);
});

if (uiMode === "tui") {
  const tui = renderTui(runtime);
  await tui.waitUntilExit();
  await shutdownAndExit("TUI exited", 0);
} else {
  process.stdin.on("data", async (data) => {
    await runtime.commands.submitLegacyConsoleInput(data.toString());
  });
  process.stdin.resume();
}
