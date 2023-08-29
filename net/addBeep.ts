import { Message } from "discord.js";
import { request } from "undici";
import utils from "../utils";

export const addBeep = async (message: Message) => {
			const {DATA_URL} = process.env
			const link = message.cleanContent.match(utils.hasSauce)[0]
            await request('http://localhost:3000/content/user/' + message.author.id, {
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
                    "published": Date.now(),
                    "discordId": message.id,
                    "authors": [message.author.id],
                    "sheets": ["community"],
                    "basedOn": []
                })
            })
}