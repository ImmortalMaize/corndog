import { ReadableEvent } from "../classes";
import { MessageReaction, Message, User, TextChannel, EmbedBuilder, ColorResolvable, userMention, time } from "discord.js"
import { picks, roles, channels, config } from "../config"
import { finishedBeep } from "../redis/entities"
import utils from "../utils"

export default new ReadableEvent("messageReactionAdd", async (reaction: MessageReaction, user: User) => {
    if (!(reaction.message.channel.id === channels["finished-beeps"])) {
        return
    }
    console.log("New beep!")
    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (exception: unknown) {
            console.log("Uuuuh...")
        }
    }

    const guild = reaction.message.guild
    const member = guild.members.cache.get((reaction.message.author as User).id)
    if (reaction.emoji.name === utils.emojis.hand) {
        const count = (await reaction.message.reactions.cache.get(utils.emojis.hand).users.fetch()).filter(user => user.id !== (member.id ?? reaction.message.author.id) && user.id !== config.clientId).size
        console.log('👌:' + count)
        const quota = count >= picks.quota
        const precedent = await finishedBeep.search("submission", reaction.message.id)

        const reward = guild.roles.cache.get(roles.picked)

        const finishedBeeps = guild.channels.cache.get(channels["finished-beeps"]) as TextChannel
        const finishedPicks = guild.channels.cache.get(channels["finished-picks"]) as TextChannel

        if (quota) {
            if (precedent) {
                console.log("Quota and precedent met!")
                const embedID = precedent.toJSON().embed
                console.log(embedID)

                const embed = utils.pickEmbed(reaction.message as Message, count);
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
                member.roles.add(reward)

                const embed = utils.pickEmbed(reaction.message as Message, count)
                const old = utils.time.compare(utils.time.goBack(1, "month").toDate(), reaction.message.createdAt)
                const pick = await finishedPicks.send({
                    content: `Congratulations ${old ? member.nickname ?? reaction.message.author.username : userMention(member.id ?? reaction.message.author.id)} on getting picked!`,
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
})
