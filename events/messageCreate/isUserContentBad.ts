import { Message } from "discord.js"
import { hasUrl } from "../../utils"

export default async function isUserContentBad(message: Message): Promise<boolean> {
    const { attachments, cleanContent } = message
    const noAttachments = attachments.size === 0
    const tooManyAttachments = attachments.size > 1
    attachments.first()
    const applicationAttachment = noAttachments ? false : attachments.first().contentType.match(/^application/g) ? true : false
    if (tooManyAttachments || applicationAttachment) return true
    
    const urls = cleanContent.match(hasUrl)
    return !urls && noAttachments ? true : false
}
