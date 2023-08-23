import { Message } from "discord.js"
import utils from "."

export default  (message: Message) => {
	const link = utils.getLink(message)
	const blurb = link ? message.cleanContent
            .replaceAll(utils.hasSauce, "")
            .replaceAll(/^\n$/gm, "")
            : message.cleanContent
    return blurb
}