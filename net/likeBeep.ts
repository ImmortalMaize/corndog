import { Message, User } from "discord.js"
import { request } from "undici"
import {getBlurb, getLink} from "../utils"

export const likeBeep = async (beep: Message, liker: User, author: User) => {
	const { DATA_URL } = process.env
    const contentType = { 'Content-Type': 'application/json' }
        return await request(DATA_URL + 'bot/likeBeep/', {
            method: 'POST',
            headers: contentType,
            body: JSON.stringify({
                liker: liker.id,
                beep: beep.id,
                author: author.id
            })
        }).then(() => {
            console.log("Liker " + liker.id + " liked beep " + beep.id + ".");
        })
}