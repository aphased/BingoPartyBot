import { Collection } from "discord.js";
import Utils from "../../utils/Utils.mjs";
import Webhook from "../../utils/Webhook.mjs";

export default {
    name: "Kick Event",
    description: "The message event stuff",
    /**
     * 
     * @param {import("../Bot.mjs").default} bot 
     */
    execute: async function (bot, reason, loggedIn) {
        bot.utils.log("Kicked from server for reason: " + reason, "Error");
        bot.webhook.send({
            username: bot.config.webhook.name,
        }, {
            content: "Kicked from server for reason: " + reason.extra[0].text
        });
    }
  }
  