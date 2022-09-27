import { ReadableEvent } from "../classes";
import { MessageReaction, Message, User, TextChannel, EmbedBuilder, ColorResolvable, userMention, time} from "discord.js"
import { picks, channels, config } from "../config"
import { finishedBeep } from "../redis/entities"
import utils from "../utils"

const pickEmbed = (
    submission: Message,
    count: number
) => {
    const member  = submission.guild.members.cache.get((submission.author as User).id)
    const nickname = member?.nickname ?? member?.user.username
    const avatar = member?.avatarURL() ?? member?.user.avatarURL()
    const sauce = submission.cleanContent.match(utils.hasSauce)
    const blurb = (sauce ? submission.cleanContent
        ?.replaceAll(utils.hasSauce, "")
        ?.replaceAll(/^\n$/gm, "")
        : submission.cleanContent) as string

    const colors = utils.colorScale(config.colors)

    return new EmbedBuilder()
    .setTitle("It's " + nickname as string + "!")
    .setURL(submission.url)
    .setThumbnail(avatar as string)
    .setColor(colors(Math.random()).hex() as ColorResolvable)
    .setDescription(blurb.length > 0 ? blurb : "undefined")
    .addFields(
        {name: "Sauce 🎵", value: sauce?.join("\n") ?? "undefined", inline: true},
        {name: "Score 👌", value: String(count), inline: true}
    )
    .setFooter({
        text: "Submitted " + utils.relativeTime(submission.createdTimestamp)
    })
}

export default new ReadableEvent("messageReactionAdd", async (reaction: MessageReaction, user: User) => {
    if (!(reaction.message.channel.id === channels["finished-beeps"])) {
        return
    }
    console.log("New!")
    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (exception: unknown) {
            console.log("Uuuuh...")
        }
    }
    
    const guild = reaction.message.guild
    const member = guild?.members.cache.get((reaction.message.author as User).id)
    const count = (await reaction.message.reactions.cache.get('👌')?.users.fetch()).filter(user => user.id !== member.id && user.id !== config.clientId).size
    console.log('👌:' + count)
    const quota = count >= picks.quota
    const precedent = await finishedBeep.search("submission", reaction.message.id)
    
    const reward = guild?.roles.cache.get(picks.reward)

    const finishedBeeps = guild?.channels.cache.get(channels["bot-commands"]) as TextChannel
    const finishedPicks = guild?.channels.cache.get(channels["finished-picks"]) as TextChannel

    if (quota) {
        if (precedent) {
            console.log("Quota and precedent met!")
            const embedID = precedent.toJSON().embed
            console.log(embedID)
            
            const embed = pickEmbed(reaction.message as Message, count)
            const channel = await finishedPicks.messages.fetch()
            channel.get(embedID).edit({
                embeds: [embed]
            })

        } else {
            console.log("Quota but no precedent!")
            member?.roles.add(reward)

            const embed = pickEmbed(reaction.message as Message, count)
            const pick = await finishedPicks.send({
                content: `Congratulations ${userMention(member.id)} on getting picked!`,
                embeds: [embed]
            })

            await finishedBeep.generate({
                submission: reaction.message.id,
                embed: pick.id
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
})
