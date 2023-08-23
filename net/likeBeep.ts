import { Message, User } from "discord.js"
import { request } from "undici"
import utils from "../utils"

export const likeBeep = async (message: Message, liker: User, author: User) => {
	const blurb = utils.getBlurb(message)
	const link = utils.getLink(message)[0]
	const { DATA_URL } = process.env
	await request(DATA_URL + '/content/user/' + message.author.id, {
            method: 'PUT',
            headers: {
            	'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: author.username
            })
        })
        await request(DATA_URL + '/content/beep/' + message.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "sauce": link,
                    "authors": [author.id],
                    "sheets": [{
                        name: "community",
                        caption: blurb
                    }],
                    "basedOn": []
                })
            })
        await request(DATA_URL + '/content/user/' + liker.id, {
            method: 'PUT',
            headers: {
            	'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: liker.username
            })
        })
        return await request(DATA_URL + '/content/beep/' + message.id + '/liked_by/' + liker.id, {
            method: 'POST',
            headers: {
            	'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
}