import { Message, User } from "discord.js"
import { request } from "undici"
import {getBlurb, getLink} from "../utils"

export const likeBeep = async (beep: Message, liker: User, author: User) => {
	const { DATA_URL } = process.env
    const contentType = { 'Content-Type': 'application/json' }
        return await request(DATA_URL + 'bot/' + beep.id + '/likeBeep' + liker.id, {
            method: 'POST',
            headers: contentType,
            body: JSON.stringify({
                liker,
                beep,
                author,
            })
        }).then(() => {
            console.log("Liker " + liker.id + " liked beep " + beep.id + ".");
        })
}