"use strict";
import { log, logDebug, err } from "./utils.mjs";
import dotenv from "dotenv";
dotenv.config();
import { Client, Events, GatewayIntentBits } from "discord.js";
import { bridgingToDiscordEnabled } from "../index.mjs";

export { initDiscordBot, getBingoGuideLink, setBingoGuideLink };

let linkToBingoGuide;
const discordBotToken = process.env.DISCORD_BOT_TOKEN;
let botIsFunctional = false;

function initDiscordBot() {
  if (discordBotToken) {
    client.login(discordBotToken);
    // botIsFunctional status is updated only once bot is ready,
    // see client.once() below
  } else {
    log("No Discord bot token set! Not logging in...");
    bridgingToDiscordEnabled[0] = false;
  }
}

const client = new Client({
  intents: [
    // Necessary to read messages
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    // Necessary for updating  party member count as channel name:
    // (… idea for the future)
    // GatewayIntentBits.ChannelUpdate (..?)
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  log(`Discord bot ready! Logged in as ${readyClient.user.tag}`);
  botIsFunctional = true;
  // Retrieve potentially newest link once on every program startup
  fetchLatestGuideMessage();
});

/**
 * @param {string} newGuideLink  The updated link for manual overrides (in case
 * of failures in the Discord fetching system – so that there is no need to
 * restart the main BingoPartyBot). No checks are performed on this parameter,
 * so use carefully!
 */
function setBingoGuideLink(newGuideLink) {
  linkToBingoGuide = newGuideLink;
}

/**
 * Gets the latest bingo guide post on the Hypixel forums according to the usual
 * URL scheme (containing `bingo-guide-for-{month}-{year}`),
 * including fetching an update if it is outdated based on the current month/year
 * vs. the values found within the URL.
 * @returns{string}  The URL to the current month's Bingo guide, assuming it has
 * been posted. If there is no current URL, or the connection to Discord couldn't
 * be established, an empty string is returned.
 */
function getBingoGuideLink() {
  if (!linkToBingoGuide) {
    if (!botIsFunctional) {
      err("Discord bot not functional");
      // return "Bingo.";
      return "";
    } else {
      // TODO: verify that this does work as intended... write a test maybe?
      // changes the module variable, meaning we don't need to store and assign
      log("No link to guide stored, fetching now...");
      fetchLatestGuideMessage();
      return linkToBingoGuide;
    }
  }

  logDebug("linkToBingoGuide already defined as '" + linkToBingoGuide + "'");

  if (!isGuideLinkUpToDate(linkToBingoGuide)) {
    log("Updating to latest guide link...");
    fetchLatestGuideMessage();
  }

  return linkToBingoGuide;
}

function isGuideLinkUpToDate(guideLink) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  // Note: January is 0, December is 11
  const currentMonth = currentDate.getMonth();

  const url = guideLink;

  // Extract year and month from the URL, https://regex101.com/r/4x8O6n/1
  const urlParts = url.match(/bingo-guide-for-(\w+)-(\d{4})/);
  if (!urlParts) {
    err("Current Bingo guide check: URL pattern does not match.");
    return false;
  }

  const urlMonthName = urlParts[1].toLowerCase();
  const urlYear = parseInt(urlParts[2], 10);

  // Convert month name to index
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const urlMonthIndex = monthNames.indexOf(urlMonthName);

  if (urlMonthIndex === -1) {
    err("Current Bingo guide check: Invalid month in URL.");
    return false;
  }

  // Check if we need to update
  if (
    currentYear > urlYear ||
    (currentYear === urlYear && currentMonth > urlMonthIndex)
  ) {
    // Have to update, link is not up to date
    // fetchLatestGuideMessage(); // (fetching now done by caller of this function for clearer control flow)
    return false;
  } else {
    logDebug("The guide is up to date.");
    return true;
  }
}

async function fetchLatestGuideMessage() {
  if (!botIsFunctional) {
    logDebug("Bot not functional, not fetching latest guide message...");
    return;
  }

  logDebug("Ready to fetch guide link from Discord!");
  const channelId = process.env.BINGO_GUIDE_CHANNEL_ID;
  // Fetching messages unfortunately not possible simply with webhook alone:
  // const bingoGuideWebhookURL = process.env.WEBHOOK_URL_GUIDE;

  // Fetch channel
  const channel = await client.channels.fetch(channelId);

  if (!channel.isTextBased || !("messages" in channel)) {
    logDebug(`The channel ${channelId} is not a text-based channel.`);
  }

  // Fetch channel's latest message
  let messages = await channel.messages.fetch({ limit: 1 });
  const latestMessage = messages.first();

  if (!latestMessage) {
    logDebug(`No messages found in ${channel.name}`);
    // TODO: insert a Discord ping @aphased here, perhaps?
    return;
  }

  logDebug(`Latest message in ${channel.name}:`);
  logDebug(`${latestMessage.author.tag}: ${latestMessage.content}`);

  // Check if there have been other non-link posts in #announcements recently,
  // and try to determine a guide link from prior messages if yes
  if (latestMessage.content.startsWith("https://hypixel.net/threads/")) {
    linkToBingoGuide = latestMessage.content;
    return;
  }

  // Alternative case:
  // Fetch the last 5 (todo random guess?) messages in search of a link
  messages = await channel.messages.fetch({ limit: 5 });

  let linkFound = false;
  // Loop through them to find a potential match
  for (const message of messages.values()) {
    if (message.content.startsWith("https://hypixel.net/threads/")) {
      linkToBingoGuide = message.content;
      logDebug(
        `Found guide link in message by ${message.author.tag}: ${message.content}`,
      );
      linkFound = true;
      break;
    }
  }

  if (!linkFound) {
    // Caller (i.e. in `!p guide` handling at top level) has to deal with that
    linkToBingoGuide = "";
  }

  // TODO: Optionally, we could close the bot after fetching the message
  // – does this make sense?
  // client.destroy();
}