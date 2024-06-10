import { log, logDebug, err } from './utils.mjs';
import dotenv from 'dotenv';
dotenv.config();
import { Client, Events, GatewayIntentBits } from 'discord.js';

export { getBingoGuideLink, setBingoGuideLink };


let linkToBingoGuide;
const BINGO_GUIDE_CHANNEL_ID = "1247115694231781376";
// Fetching messages unfortunately not possible simply with webhook alone:
// const bingoGuideWebhookURL = process.env.WEBHOOK_URL_GUIDE;
const discordBotToken = process.env.DISCORD_BOT_TOKEN;
let botIsFunctional = false;


const client = new Client({
	intents: [
    // necessary to read messages
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		// necessary for updating (… idea for the future) party member count as
		// channel name: GatewayIntentBits.ChannelUpdate (..?)
	],
});

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, readyClient => {
	log(`Ready! Logged in as ${readyClient.user.tag}`);
  botIsFunctional = true;
});

// Log in to Discord with client's token
// logDebug("discordBotToken: '"+ discordBotToken + "'");
client.login(discordBotToken);


// Retrieve once on every startup
client.once('ready', fetchLatestGuideMessage);



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
 */
function getBingoGuideLink() {
	if (!linkToBingoGuide) {
		if (!botIsFunctional) {
			err("Discord bot not functional");
			return "";
		} else {
			// TODO: verify that this does work as intended... write a test maybe?
			// changes the module variable, meaning we don't need to store and assign
			fetchLatestGuideMessage(); 
			return linkToBingoGuide;
		}
	}

  logDebug("linkToBingoGuide already defined as '" + linkToBingoGuide + "'");

	if (!isGuideLinkUpToDate(linkToBingoGuide)) {
		fetchLatestGuideMessage();
	}
	
  return linkToBingoGuide;
}


function isGuideLinkUpToDate(guideLink) {
	// old "implementation notes":
	// TODO: add checks & re-fetching logic if link is outdated (i.e. from one or
	// more months prior, e.g. if bot has been up continuously for a long time)
	// return true;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
	// Note: January is 0, December is 11
  const currentMonth = currentDate.getMonth(); 

  const url = guideLink;

  // Extract year and month from the URL, https://regex101.com/r/4x8O6n/1
  const urlParts = url.match(/bingo-guide-for-(\w+)-(\d{4})/);
  if (!urlParts) {
      err("URL pattern does not match.");
      return;
  }

  const urlMonthName = urlParts[1].toLowerCase();
  const urlYear = parseInt(urlParts[2], 10);

  // Convert month name to index
  const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const urlMonthIndex = monthNames.indexOf(urlMonthName);

  if (urlMonthIndex === -1) {
      console.error('Invalid month in URL.');
      return;
  }

  // Check if we need to update
  if (currentYear > urlYear || (currentYear === urlYear && currentMonth > urlMonthIndex)) {
      log("Updating to latest guide...");
      fetchLatestGuideMessage();
  } else {
      logDebug("The guide is up to date.");
  }
}


async function fetchLatestGuideMessage() {
	
  log("Ready to fetch guide link from Discord!");
	const channelId = BINGO_GUIDE_CHANNEL_ID; // 'YOUR_CHANNEL_ID';
  
  // Fetch channel
  const channel = await client.channels.fetch(channelId);

  if (channel.isTextBased && "messages" in channel) {
    // Fetch channel's latest message
    const messages = await channel.messages.fetch({ limit: 1 });
    const latestMessage = messages.first();
    
    if (latestMessage) {
      log(`Latest message in ${channel.name}:`);
      log(`${latestMessage.author.tag}: ${latestMessage.content}`);
			linkToBingoGuide = latestMessage.content;
    } else {
      log(`No messages found in ${channel.name}`);
    }
  } else {
    log(`The channel ${channelId} is not a text-based channel.`);
  }

  // TODO: Optionally, we could close the bot after fetching the message 
	// – does this make sense?
  // client.destroy();
}

