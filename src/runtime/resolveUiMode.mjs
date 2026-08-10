function parseExplicitMode(argv = []) {
  let explicitMode;
  for (const arg of argv) {
    if (arg === "--tui") explicitMode = "tui";
    if (arg === "--no-tui") explicitMode = "headless";
  }
  return explicitMode;
}

function parseEnvMode(env = process.env) {
  const value = env.BPB_TUI?.toLowerCase?.();
  if (!value || value === "auto") return null;
  if (["1", "true", "yes", "on"].includes(value)) return "tui";
  if (["0", "false", "no", "off"].includes(value)) return "headless";
  return null;
}

export default function resolveUiMode({
  argv = process.argv.slice(2),
  env = process.env,
  stdinIsTTY = process.stdin.isTTY,
  stdoutIsTTY = process.stdout.isTTY,
} = {}) {
  return (
    parseExplicitMode(argv) ??
    parseEnvMode(env) ??
    (stdinIsTTY && stdoutIsTTY ? "tui" : "headless")
  );
}
