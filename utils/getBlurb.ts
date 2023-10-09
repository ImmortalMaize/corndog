import { Message } from "discord.js"
import { getLink, hasSauce } from "."

export const getBlurb = (message: Message) => {
	const link = getLink(message)
	const blurb = link ? message.cleanContent
            .replaceAll(hasSauce, "")
            .replaceAll(/^\n$/gm, "")
            : message.cleanContent
    return blurb
}