import { Message, TextChannel } from "discord.js"
import { channels } from "../../config"
import { getChannel, getReactions, emojis, woof } from "../../utils"
import generateFlagMessage from "./generateFlagMessage"
import { report as reportInventory } from "../../redis/entities"

export default async (message: Message) => {
    const { url, cleanContent, member, guild, attachments } = message
    console.log(member.user.id)
    const reportsChannel = await getChannel(guild.channels, channels.reports) as TextChannel
    const reports = (await getReactions(message, emojis.report).users.fetch()).filter(user => user.id !== "203221713440210944").size
    const existingReport = await reportInventory.get("link", url)

    if (existingReport) {
        const { link, mod, content } = existingReport
        const reportMessage = await reportsChannel.messages.fetch(existingReport.id)

        if (reportMessage) reportMessage.edit(generateFlagMessage(link, content, member.user))
        else reportsChannel.send(generateFlagMessage(link, content, member.user))
        return
    }
    
    if (reports >= 3) {
        const attachmentLinks = attachments.map(attachment => attachment.url).join(' ')
        const content = cleanContent + " " + attachmentLinks
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