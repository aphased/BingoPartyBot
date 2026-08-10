import RuntimeEvents from "../src/runtime/RuntimeEvents.mjs";
import OperatorCommands from "../src/runtime/OperatorCommands.mjs";
import renderTui from "../src/tui/renderTui.mjs";

let activeFilter = "all";

const events = new RuntimeEvents({ limit: 1000 });
const fakeBot = {
  config: {
    partyCommandPrefix: "!p",
    verbosityMc: 2,
    debug: {
      disableMinecraft: false,
      disableDiscord: true,
    },
    tui: {
      showTimestamps: true,
    },
  },
  getUsername() {
    return "BingoParty";
  },
  chat(message) {
    events.emit({
      source: "minecraft",
      kind: "command",
      level: "info",
      text: message,
      metadata: {
        direction: "outbound",
      },
    });
  },
  async onMessage(message) {
    events.emit({
      source: "operator",
      kind: "command",
      level: "info",
      text: message.toString(),
      metadata: {
        direction: "outbound",
      },
    });
  },
  connect() {
    events.emit({
      source: "system",
      kind: "status",
      level: "info",
      text: "Reconnect requested from demo runtime.",
    });
  },
  disconnect() {
    events.emit({
      source: "system",
      kind: "status",
      level: "info",
      text: "Disconnect requested from demo runtime.",
    });
  },
  async reloadPartyCommands() {
    events.emit({
      source: "system",
      kind: "status",
      level: "info",
      text: "Reloaded party commands in demo runtime.",
    });
  },
  getStatusSnapshot() {
    return {
      enabled: true,
      connected: true,
      connecting: false,
      reconnecting: false,
      username: "BingoParty",
      verbosityLevel: 2,
    };
  },
};

const commands = new OperatorCommands({
  minecraftBot: fakeBot,
  events,
});

const runtime = {
  events,
  commands,
  getSnapshot() {
    return {
      config: fakeBot.config,
      minecraft: fakeBot.getStatusSnapshot(),
      discord: {
        enabled: false,
        ready: false,
        disabled: true,
      },
      activeFilter,
      recentEvents: events.getSnapshot(),
    };
  },
  async shutdown() {
    clearInterval(intervalId);
  },
};

commands.setActionHandlers({
  setFilter(nextFilter) {
    activeFilter = nextFilter;
    return true;
  },
});

const sampleMessages = [
  "Party > [MVP+] SplashHost: !guide",
  "From [VIP] ExampleUser: boop!",
  "Guild > GuildMate: starting in 2 minutes",
  "Kicked DemoUser because they were offline.",
];

let counter = 0;
const intervalId = setInterval(() => {
  const message = sampleMessages[counter % sampleMessages.length];
  events.emit({
    source: "minecraft",
    kind: "chat",
    level: counter % 4 === 3 ? "warn" : "info",
    text: message,
    metadata: {
      direction: "inbound",
    },
  });
  counter += 1;
}, 800);

events.emit({
  source: "system",
  kind: "status",
  level: "info",
  text: "Demo runtime started. Type while new messages arrive.",
});

const tui = renderTui(runtime);
await tui.waitUntilExit();
