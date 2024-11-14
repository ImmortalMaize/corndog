import { Message } from "discord.js"
import { getLink, hasUrl } from "."

export const getBlurb = (message: Message) => {
	const link = getLink(message)
	const blurb = link ? message.cleanContent
            .replaceAll(hasUrl, "")
            .replaceAll(/^\n$/gm, "")
            : message.cleanContent
    return blurb
}