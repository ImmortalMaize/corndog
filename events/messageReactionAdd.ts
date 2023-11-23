import { ReadableEvent } from "../classes";
import { MessageReaction, Message, User, TextChannel, userMention, roleMention} from "discord.js"
import { picks, roles, channels, config } from "../config"
import { finishedBeep, member as memberInventory } from "../redis/entities"
import { time, pickEmbed, emojis,hasSauce} from "../utils"
import { report as reportInventory} from "../redis/entities"
import { likeBeep } from "../net";

const generateReportMessage = (count: number, link: string, mod?: string) => {
    let message = `${roleMention(roles.reports)} A post has been reported ${count} times in ${link}. `
    if (mod) message += `${userMention(mod)} has taken a look. `
    return message
}

export default new ReadableEvent("messageReactionAdd", async (reaction: MessageReaction, user: User) => {
    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (exception: unknown) {
            console.log("Uuuuh...")
        }
    }

    if (reaction.emoji.name === emojis.report) {
        const message = reaction.message
        const reportsChannel = reaction.message.guild?.channels.cache.get(channels["reports"]) as TextChannel

        const reports = message.reactions.cache.get(emojis.report).count 
        const link = message.url
        const existingReport = await reportInventory.get("link", link)
        if (existingReport) {
            const { link, mod } = existingReport
            const reportMessage = await reportsChannel.messages.fetch(existingReport.id)
            if (reportMessage) reportMessage.edit({
                content: generateReportMessage(reports, link, mod),
            })
            else reportsChannel.send({
                content: generateReportMessage(reports, link, mod),
            })
            return
        }
        else if (reports >= 3) {
            const report = await reportsChannel.send({
                content: generateReportMessage(reports, link)
            })
            await reportInventory.generate({
                id:  report.id,
                link: link,
                mod: null,
                resolved: null
            })
        }
    }

    if (reaction.message.channel.id === channels["finished-beeps"]) {
    const guild = reaction.message.guild
    const member = (guild.members.cache.get((reaction.message.author as User)?.id)) ?? (await guild.members.fetch((reaction.message.author as User)?.id))
    if (reaction.emoji.name === emojis.hand) {
        const count = (await reaction.message.reactions.cache.get(emojis.hand).users.fetch()).filter(user => { if (user?.id) return user.id !== (member?.id ?? reaction.message.author.id ) && user.id !== config.clientId; else return false}).size
        console.log('👌:' + count)
        const quota = count >= picks.quota
        const precedent = await finishedBeep.get("submission", reaction.message.id)

        const reward = guild.roles.cache.get(roles.picked)
        const finishedPicks = guild.channels.cache.get(channels["finished-picks"]) as TextChannel

        const link = reaction.message.cleanContent.match(hasSauce)[0]
        console.log(link)
        const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message
        likeBeep(message as Message, user, reaction.message.author)

        if (quota) {
            if (precedent) {
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

            } else {
                console.log("Quota but no precedent!")
                const memberData = await memberInventory.get("id", member.id ?? reaction.message.author.id)
                const scopeUnit: "years"|"months"|"weeks"|"days" = memberData ? memberData.toJSON()["picks scope unit"] : "month"
                const scopeNumber = memberData ? memberData.toJSON()["picks scope number"] : 1
                const pings: boolean = memberData ? memberData.toJSON()["picks pings"] : false
                member.roles.add(reward)

                const embed = pickEmbed(reaction.message as Message, count)
                const old = time.compare(time.goBack(scopeNumber, scopeUnit).toDate(), reaction.message.createdAt)
                const pick = await finishedPicks.send({
                    content: `Congratulations ${!pings ? (member.nickname ?? reaction.message.author.username) : userMention(member.id ?? reaction.message.author.id)} on getting picked!`,
                    embeds: [embed]
                })

                //@ts-ignore
                await finishedBeep.generate({
                    submission: reaction.message.id,
                    embed: pick.id,
                    count: count,
                    date: reaction.message.createdAt
                })
                console.log("Generated ting")
            }
        } else {
            if (precedent) {
                console.log("Quota not met but precedented!")
            } else {
                console.log("Quota and precedent not met!")
            }
        }
    }
}
})

