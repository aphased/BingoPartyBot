const DEFAULT_LIMIT = 1000;

export const FILTER_PRESETS = Object.freeze({
  all: () => true,
  minecraft: (event) => event.source === "minecraft",
  discord: (event) => event.source === "discord",
  system: (event) => event.source === "system",
  operator: (event) => event.source === "operator",
  sent: (event) =>
    event.metadata?.direction === "outbound" || event.kind === "command",
  errors: (event) => ["warn", "error"].includes(event.level),
});

export function matchesRuntimeFilter(event, filter = "all") {
  if (typeof filter === "function") return filter(event);
  if (typeof filter === "string")
    return (FILTER_PRESETS[filter] ?? FILTER_PRESETS.all)(event);
  if (!filter) return true;

  if (filter.sources?.length && !filter.sources.includes(event.source))
    return false;
  if (filter.levels?.length && !filter.levels.includes(event.level))
    return false;
  if (filter.kinds?.length && !filter.kinds.includes(event.kind)) return false;
  if (filter.query) {
    const query = filter.query.toLowerCase();
    const haystack = `${event.text} ${JSON.stringify(event.metadata ?? {})}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filter.predicate && !filter.predicate(event)) return false;
  return true;
}

export default class RuntimeEvents {
  constructor({ limit = DEFAULT_LIMIT } = {}) {
    this.limit = limit;
    this.nextId = 1;
    this.events = [];
    this.subscribers = new Map();
  }

  emit(event = {}) {
    const normalized = {
      id: this.nextId++,
      timestamp: event.timestamp ?? Date.now(),
      source: event.source ?? "system",
      kind: event.kind ?? "status",
      level: String(event.level ?? "info").toLowerCase(),
      text: String(event.text ?? ""),
      ansiText: event.ansiText ?? null,
      metadata: event.metadata ?? {},
    };

    this.events.push(normalized);
    if (this.events.length > this.limit)
      this.events.splice(0, this.events.length - this.limit);

    for (const subscriber of this.subscribers.values()) subscriber(normalized);
    return normalized;
  }

  subscribe(subscriber) {
    const id = Symbol("runtime-subscriber");
    this.subscribers.set(id, subscriber);
    return () => {
      this.subscribers.delete(id);
    };
  }

  getSnapshot(filter = "all") {
    return this.events.filter((event) => matchesRuntimeFilter(event, filter));
  }

  clear() {
    this.events = [];
  }
}
