import { Message, TextChannel } from "discord.js"
import { channels } from "../../config"
import { getChannel, getReactions, emojis, woof, tracer } from "../../utils"
import generateFlagMessage from "./generateFlagMessage"
import { report as reportInventory } from "../../redis/entities"
import { inverse } from "colors"

export default async (message: Message) => {
    const { url, cleanContent, member, guild, attachments } = message
    tracer.log(`Message by ${inverse(member.user.username)} reported.`)
    const reportsChannel = await getChannel(guild.channels, channels.reports) as TextChannel
    const reports = (await getReactions(message, emojis.report).users.fetch()).size
    const existingReport = await reportInventory.get("link", url)

    if (existingReport) {
        tracer.info("Report already generated for " + existingReport.link)
        const { link, mod, content } = existingReport
        const reportMessage = await reportsChannel.messages.fetch(existingReport.id)

        if (reportMessage) reportMessage.edit(generateFlagMessage(link, content, member.user))
        else reportsChannel.send(generateFlagMessage(link, content, member.user))
        return
    }
    
    if (reports >= 3) {
        const attachmentLinks = attachments.map(attachment => attachment.url).join(' ')
        const content = cleanContent + " " + attachmentLinks
        console.log("yeah")
        if (message.channelId !== channels["finished-beeps"]) message.reply("I have reported this message to management. Someone should be here shortly. " + woof() + "!") 
        
            const report = await reportsChannel.send(generateFlagMessage(url, content, member.user))
        await report.react(emojis.oui)

        await reportInventory.generate({
            type: "flag",
            id: report.id,
            link: url,
            content,
            mod: "",
            resolved: null,
            user: member.user.id
        })
        
    }
}
