import { ReadableEvent } from "../classes";
import { MessageReaction, Message, User, TextChannel, userMention, roleMention, BaseMessageOptions } from "discord.js"
import { picks, roles, channels, config } from "../config"
import { finishedBeep, member as memberInventory } from "../redis/entities"
import { time, pickEmbed, emojis, reportEmbed, getChannel, getReactions, getMember, getRole, getLink } from "../utils"
import { report as reportInventory } from "../redis/entities"
import { likeBeep } from "../net";
import { impartial } from "../utils";

export default new ReadableEvent("messageReactionAdd", async (reaction: MessageReaction, user: User) => {
    await impartial(reaction)
    const { name } = reaction.emoji

    if (name === emojis.report) {
        const { message } = reaction
        await impartial(message)
        handleReport(message as Message)
    }

    if (reaction.message.channel.id === channels["finished-beeps"] && name === emojis.hand) {
        handleBeep(reaction, user)
    }
})
const handleBeep = async (reaction: MessageReaction, user: User) => {

    const { message } = reaction
    await impartial(message)

    const { guild, author } = message
    const member = await getMember(guild.members, author.id)
    const count = (await getReactions(message as Message, emojis.hand).users.fetch()).filter(user => {
        if (user.id) return user.id !== (member.id ?? message.author.id) && user.id !== config.clientId; else return false
    }).size
    console.log('👌:' + count)
    const quota = count >= picks.quota
    const precedent = await finishedBeep.get("submission", reaction.message.id)

    const reward = await getRole(guild.roles, roles.picked)
    const finishedPicks = await getChannel(guild.channels, channels["finished-picks"]) as TextChannel

    const link = getLink(message as Message)[0]
    console.log(link)

    likeBeep(message as Message, user, reaction.message.author)
    if (quota) {
        if (quota && precedent) {
            console.log("Quota and precedent met!")
            const embedID = precedent.toJSON().embed
            console.log(embedID)

            const embed = pickEmbed(reaction.message as Message, count);
            (await finishedPicks.messages.fetch(embedID))
                .edit({
                    embeds: [embed]
                })

            finishedBeep.amend(precedent.entityId, [
                ["count", count]
            ])

            console.log("Amended ting; " + count)

        }
        if (quota && !precedent) {
            console.log("Quota but no precedent!")
            const memberData = await memberInventory.get("id", member.id ?? reaction.message.author.id)
            const scopeUnit: "years" | "months" | "weeks" | "days" = memberData ? memberData.toJSON()["picks scope unit"] : "month"
            const scopeNumber = memberData ? memberData.toJSON()["picks scope number"] : 1
            const pings: boolean = memberData ? memberData.toJSON()["picks pings"] : false
            await member.roles.add(reward)

            const embed = pickEmbed(reaction.message as Message, count)
            const old = time.compare(time.goBack(scopeNumber, scopeUnit).toDate(), reaction.message.createdAt)
            const pingOrNah = !pings || old ? (member.nickname ?? author.username) : userMention(member.id ?? author.id)
            const pick = await finishedPicks.send({
                content: `Congratulations ${pingOrNah} on getting picked!`,
                embeds: [embed]
            })

            //@ts-ignore
            await finishedBeep.generate({
                submission: message.id,
                embed: pick.id,
                count,
                date: message.createdAt
            })
            console.log("Generated ting")
        }
    }
}
const handleReport = async (message: Message) => {
    const { url, cleanContent, member, guild, attachments } = message
    const reportsChannel = await getChannel(guild.channels, channels.reports) as TextChannel
    const reports = (await getReactions(message, emojis.report).users.fetch()).filter(user => user.id !== "203221713440210944").size

    const existingReport = await reportInventory.get("link", url)
    if (existingReport) {
        const { link, mod, content } = existingReport
        const reportMessage = await reportsChannel.messages.fetch(existingReport.id)

        if (reportMessage) reportMessage.edit(generateReportMessage(reports, link, content, member.user, mod))
        else reportsChannel.send(generateReportMessage(reports, link, content, member.user, mod))
        return
    }
    
    if (reports >= 3) {
        const attachmentLinks = attachments.map(attachment => attachment.url).join(' ')
        const content = cleanContent + " " + attachmentLinks
        const report = await reportsChannel.send(generateReportMessage(reports, url, content, member.user))
        await reportInventory.generate({
            id: report.id,
            link: url,
            content,
            mod: null,
            resolved: null,
            user: member.user.id
        })
    }
}
const generateReportMessage = (count: number, link: string, message: string, user: User, mod?: string): BaseMessageOptions => {
    let content = `${roleMention(roles.reports)} A post has been flagged ${count} times in ${link}! `
    if (mod) content += `${userMention(mod)} took a look. `
    return {
        content,
        embeds: [reportEmbed(user, message)]
    }
}

