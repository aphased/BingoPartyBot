import util from "util";

const CONSOLE_METHODS = Object.freeze({
  log: "info",
  info: "info",
  warn: "warn",
  error: "error",
  debug: "debug",
});

function formatConsoleArgs(args) {
  return args
    .map((arg) =>
      typeof arg === "string"
        ? arg
        : util.inspect(arg, { depth: 4, colors: false, breakLength: 120 }),
    )
    .join(" ");
}

export function installConsoleBridge({
  events,
  mirrorToConsole = false,
  originalConsole = console,
} = {}) {
  const originals = {};

  for (const method of Object.keys(CONSOLE_METHODS)) {
    originals[method] = originalConsole[method];
    console[method] = (...args) => {
      const level = CONSOLE_METHODS[method];
      const text = formatConsoleArgs(args);
      events?.emit({
        source: "system",
        kind: level === "error" ? "error" : level === "debug" ? "debug" : "status",
        level,
        text,
        metadata: {
          consoleMethod: method,
          origin: "console-bridge",
        },
      });

      if (mirrorToConsole) originals[method].apply(originalConsole, args);
    };
  }

  return () => {
    for (const method of Object.keys(CONSOLE_METHODS))
      console[method] = originals[method];
  };
}
