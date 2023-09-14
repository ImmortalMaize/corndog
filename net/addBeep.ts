import { Message } from "discord.js";
import { request } from "undici";
import utils from "../utils";

export const addBeep = async (message: Message) => {
			const {DATA_URL} = process.env
			const link = utils.getLink(message)[0]
            const blurb = utils.getBlurb(message)
            await request(DATA_URL + 'content/user/' + message.author.id, {
            method: 'PUT',
            headers: {},
            body: JSON.stringify({
                username: message.author.username
            })
        })
            message.react(utils.emojis.hand)
            await request(DATA_URL + 'content/beep/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "sauce": link,
                    "published": message.createdAt,
                    "discordId": message.id,
                    "authors": [message.author.id],
                    "sheets": [{
                        name: "community",
                        caption: blurb
                    }],
                    "basedOn": []
                })
            })
}