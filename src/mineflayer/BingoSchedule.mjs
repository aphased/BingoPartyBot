import axios from "axios";

const DEFAULT_API_URL = "https://api.hypixel.net/v2/resources/skyblock/bingo";
const DEFAULT_POLL_INTERVAL_MINUTES = 5;
const DEFAULT_CONNECTION_CHECK_MS = 30_000;

export default class BingoSchedule {
  constructor({ logger = console } = {}) {
    this.logger = logger;
    this.apiUrl = DEFAULT_API_URL;
    this.bot = null;
    this.config = {};
    this.eventStart = null;
    this.eventEnd = null;
    this.pollInterval = null;
    this.connectionCheckInterval = null;
  }

  setBot(bot) {
    this.bot = bot;
  }

  configure(config = {}) {
    this.config = config;
  }

  async start() {
    if (!this.bot) {
      this.log("Cannot start bingo schedule without a bot instance", "Warn");
      return;
    }
    if (this.isRunning()) return;
    this.stop();

    await this.updateSchedule();
    this.pollInterval = setInterval(
      () => this.updateSchedule(),
      this.getPollIntervalMs(),
    );
    this.connectionCheckInterval = setInterval(
      () => this.manageConnection(),
      DEFAULT_CONNECTION_CHECK_MS,
    );
    this.log("Bingo schedule monitoring started", "Info");
  }

  isRunning() {
    return Boolean(this.pollInterval || this.connectionCheckInterval);
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  async updateSchedule() {
    const times = await this.fetchEventTimes();
    if (!times) return;

    this.eventStart = times.start;
    this.eventEnd = times.end;
    this.manageConnection();
  }

  async fetchEventTimes() {
    try {
      const response = await axios.get(this.apiUrl, { timeout: 10_000 });
      const { start, end } = response.data ?? {};
      if (!start || !end) {
        this.log(
          "Bingo schedule response did not include start/end times",
          "Warn",
        );
        return null;
      }

      const eventStart = new Date(start);
      const eventEnd = new Date(end);
      if (
        Number.isNaN(eventStart.getTime()) ||
        Number.isNaN(eventEnd.getTime())
      ) {
        this.log("Bingo schedule response included invalid dates", "Warn");
        return null;
      }

      return { start: eventStart, end: eventEnd };
    } catch (error) {
      this.log(
        `Failed to fetch bingo schedule: ${error?.message ?? error}`,
        "Warn",
      );
      return null;
    }
  }

  manageConnection() {
    if (!this.bot || !this.eventStart || !this.eventEnd) return;

    const shouldBeConnected = this.isWithinConnectionWindow();
    const isConnected = this.bot.isConnected();

    if (shouldBeConnected && !isConnected) {
      this.log("Bingo connection window active; connecting bot", "Info");
      this.bot.connect({
        immediate: true,
        reason: "Bingo event window active",
      });
    } else if (!shouldBeConnected) {
      this.bot.cancelReconnect("Bingo event window inactive");
      if (isConnected) {
        this.log("Bingo connection window inactive; disconnecting bot", "Info");
        this.bot.disconnect("Bingo event window inactive");
      }
    }
  }

  isWithinConnectionWindow(now = Date.now()) {
    if (!this.eventStart || !this.eventEnd) return false;

    const startOffsetMs =
      (this.config.autoConnectBeforeMinutes ?? 0) * 60 * 1000;
    const endOffsetMs =
      (this.config.autoDisconnectAfterMinutes ?? 0) * 60 * 1000;
    const connectAt = this.eventStart.getTime() - startOffsetMs;
    const disconnectAt = this.eventEnd.getTime() + endOffsetMs;

    return now >= connectAt && now < disconnectAt;
  }

  getStatusString(now = Date.now()) {
    if (!this.eventStart || !this.eventEnd) return "Bingo schedule unavailable";

    const connectAt =
      this.eventStart.getTime() -
      (this.config.autoConnectBeforeMinutes ?? 0) * 60 * 1000;
    const disconnectAt =
      this.eventEnd.getTime() +
      (this.config.autoDisconnectAfterMinutes ?? 0) * 60 * 1000;

    if (now < connectAt) {
      return `Next bingo connection window starts in ${this.formatDuration(
        connectAt - now,
      )}`;
    }
    if (now < disconnectAt) {
      return `Bingo connection window active for ${this.formatDuration(
        disconnectAt - now,
      )}`;
    }
    return "Bingo connection window ended";
  }

  getPollIntervalMs() {
    const minutes =
      this.config.pollIntervalMinutes ?? DEFAULT_POLL_INTERVAL_MINUTES;
    return Math.max(1, minutes) * 60 * 1000;
  }

  formatDuration(ms) {
    const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    return `${minutes}m`;
  }

  log(message, type = "Info") {
    if (typeof this.logger?.log === "function") {
      this.logger.log(message, type);
      return;
    }
    console.log(`[${type}] ${message}`);
  }
}
