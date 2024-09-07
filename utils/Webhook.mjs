import { WebhookClient } from "discord.js";

export default class Webhook {
    constructor(url) {
        this.url = url;
    }

    /**
     * 
     * @param {import("discord.js").WebhookMessageCreateOptions} clientData 
     * @param {Object} messageData
     * @param {string} messageData.content
     * @param {import("discord.js").Embed} messageData.embeds
     */
    send(clientData, messageData) {
        let client = new WebhookClient({ url: this.url })
        let payload = { ...clientData, ...messageData }
        client.send(payload);
    }
}