import discordJs from "discord.js";

const optionTypes = discordJs.ApplicationCommandOptionType;
const legacyOptionTypes = discordJs.Constants?.ApplicationCommandOptionTypes;
const legacyIntents = discordJs.Intents?.FLAGS;

export const ApplicationCommandOptionType = optionTypes ?? {
  String: legacyOptionTypes?.STRING,
  Integer: legacyOptionTypes?.INTEGER,
  Boolean: legacyOptionTypes?.BOOLEAN,
  User: legacyOptionTypes?.USER,
  Channel: legacyOptionTypes?.CHANNEL,
  Role: legacyOptionTypes?.ROLE,
  Mentionable: legacyOptionTypes?.MENTIONABLE,
  Number: legacyOptionTypes?.NUMBER,
  Attachment: legacyOptionTypes?.ATTACHMENT,
};

export const Client = discordJs.Client;
export const ClientReadyEvent =
  discordJs.Events?.ClientReady ??
  (discordJs.version?.startsWith("13.") ? "ready" : "clientReady");
export const Collection = discordJs.Collection;
export const EmbedBuilder = discordJs.EmbedBuilder ?? discordJs.MessageEmbed;
export const GatewayIntentBits = discordJs.GatewayIntentBits ?? {
  Guilds: legacyIntents?.GUILDS,
  GuildMessages: legacyIntents?.GUILD_MESSAGES,
  MessageContent: legacyIntents?.MESSAGE_CONTENT,
};
export const Message = discordJs.Message;
export const REST = discordJs.REST;
export const Routes = discordJs.Routes;
export const WebhookClient = discordJs.WebhookClient;

export default discordJs;
