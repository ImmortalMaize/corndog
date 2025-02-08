import { Message } from "discord.js"
import { hasUrl } from "../../utils"

export default async function isUserContentBad(message: Message): Promise<boolean> {
    const { attachments, cleanContent } = message
    const noAttachments = attachments.size === 0
    const urls = cleanContent.match(hasUrl)
    return !urls && noAttachments ? true : false
}
