import { ReadableEvent } from "../../classes";
import { MessageReaction, Message, User, TextChannel, userMention, roleMention, BaseMessageOptions, GuildMember, GuildMemberManager } from "discord.js"
import { picks, roles, channels, config } from "../../config"
import { finishedBeep, member as memberInventory } from "../../redis/entities"
import { time, pickEmbed, emojis, reportEmbed, getChannel, getReactions, getMember, getRole, getLink } from "../../utils"
import { report as reportInventory } from "../../redis/entities"
import { impartial } from "../../utils";
import { Inventory } from "../../redis/classes";
import { ReportProps } from "../../redis/entities/report";
import onFlag from "./onFlag";
import generateFlagMessage from "./generateFlagMessage";

export default new ReadableEvent("messageReactionAdd", async (reaction: MessageReaction, user: User) => {
    if (user.id === config.clientId) return;
    const members = reaction.message.guild.members

    const { name, id } = reaction.emoji
    const { message } = reaction
    await impartial(message)
    await impartial(reaction)

    const { guild, author } = message
    const member = await getMember(guild.members, author.id)
    
    const { report, oui, non, hand } = emojis

    if (id === emojis.report && message.channel.id !== channels.announcements) onFlag(message as Message)
    if (message.channel.id === channels["finished-beeps"] && name === hand) handleBeep(reaction, user)
    if (message.channel.id === channels["reports"]) name === oui ? onOui(reaction, members) : onNon(reaction)
})
const handleBeep = async (reaction: MessageReaction, user: User) => {
    const { message } = reaction
    await impartial(message)

    const { guild, author } = message
    const member = await getMember(guild.members, author.id)
    const count = (await getReactions(message as Message, emojis.hand).users.fetch()).filter(user => {
        if (user?.id) return user.id !== (member.id ?? message.author.id) && user.id !== config.clientId; else return false
    }).size
    console.log('👌:' + count)
    const quota = count >= picks.quota
    if (!quota) return;

    const precedent = await finishedBeep.get("submission", reaction.message.id)
    const reward = await getRole(guild.roles, count >= 40 ? roles.p4 : count >= 30 ? roles.p3 : count >= 20 ? roles.p2 : roles.p1)
    await member.roles.add(reward)

    const finishedPicks = await getChannel(guild.channels, channels["finished-picks"]) as TextChannel
    const link = getLink(message as Message)[0]
    console.log(link)
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
            const memberData = await memberInventory.get("id", member?.id ?? reaction.message.author.id)
            const scopeUnit: "years" | "months" | "weeks" | "days" = memberData ? memberData.toJSON()["picks scope unit"] : "month"
            const scopeNumber = memberData ? memberData.toJSON()["picks scope number"] : 1
            const pings: boolean = memberData ? memberData.toJSON()["picks pings"] : false
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

const onOui = async (reaction: MessageReaction, members: GuildMemberManager) => {
    const { message } = reaction
    const report = await reportInventory.get("id", message.id)
    if (!report) return;

    const reactors = await reaction.users.fetch()

    report.mod = reactors.map(reactor => reactor.id).filter(id => id !== config.clientId).join(" ")
    await reportInventory.save(report)

    const { type } = report
    const handle = type === "flag" ? resolveFlag : resolveTicket

    handle(message as Message, report, members)
}
const resolveFlag = async (message: Message, report: ReportProps, members: GuildMemberManager) => {
    const member = await getMember(members, report.user)
    generateFlagMessage(report.link, report.content, member.user, report.mod)
    const { content } = message
    await message.edit(content)
}
const resolveTicket = async (message: Message, report: ReportProps, members: GuildMemberManager) => {
}
const onNon = async (reaction: MessageReaction) => {}