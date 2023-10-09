import { Message, User } from "discord.js"
import { request } from "undici"
import {getBlurb, getLink} from "../utils"

export const likeBeep = async (message: Message, liker: User, author: User) => {
	const blurb = getBlurb(message)
	const link = getLink(message)[0] 
	const { DATA_URL } = process.env
    const contentType = { 'Content-Type': 'application/json' }
	await request(DATA_URL + 'content/user/' + message.author.id, {
            method: 'PUT',
            headers: contentType,
            body: JSON.stringify({
                username: author.username
            })
        }).then(() => {
            console.log("Author " + author.id + " merged.")
        })

        await request(DATA_URL + 'content/beep/' + message.id, {
                method: 'PUT',
                headers: contentType,
                body: JSON.stringify({
                    "sauce": link,
                    "published": Date.now(),
                    "authors": [author.id],
                    "sheets": [{
                        name: "community",
                        caption: blurb
                    }],
                    "basedOn": []
                })
            }).then(() => {
                console.log("Beep " + message.id + " merged.")
            })
        await request(DATA_URL + 'content/user/' + liker.id, {
            method: 'PUT',
            headers: contentType,
            body: JSON.stringify({
                username: liker.username
            })
        }).then(() => {
            console.log("Liker " + liker.id + " merged.")
        })
        return await request(DATA_URL + 'content/beep/' + message.id + '/liked_by/' + liker.id, {
            method: 'POST',
            headers: contentType,
            body: JSON.stringify({})
        }).then(() => {
            console.log("Liker " + liker.id + " liked beep " + message.id + ".");
        })
}