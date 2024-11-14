import { Message, User, EmbedBuilder, ColorResolvable } from "discord.js"
import { config } from "../config"
import { getPurple, hasUrl, time } from "."

export const pickEmbed = (
    submission: Message,
    count: number
) => {
    const member  = submission.guild.members.cache.get((submission.author as User).id)
    const nickname = member.nickname ?? member.user.username ?? submission.author.username
    const avatar = member.avatarURL() ?? member.user.avatarURL()
    const sauce = submission.cleanContent.match(hasUrl)
    const blurb = (sauce ? submission.cleanContent
        .replaceAll(hasUrl, "")
        .replaceAll(/^\n$/gm, "")
        : submission.cleanContent) as string

    const purple = getPurple()

    return new EmbedBuilder()
    .setTitle("Check Out " + nickname as string + "'s Beep!")
    .setURL(submission.url)
    .setThumbnail(avatar as string)
    .setColor(purple as ColorResolvable)
    .setDescription(blurb.length > 0 ? blurb : "undefined")
    .addFields(
        {name: "Sauce 🎵", value: sauce.join("\n") ?? "undefined", inline: true},
        {name: "Score 👌", value: String(count), inline: true}
    )
    .setFooter({
        text: "Submitted " + time.relative(submission.createdTimestamp)
    })
}