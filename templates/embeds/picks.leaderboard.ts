import { Message, User, EmbedBuilder, ColorResolvable, EmbedData } from "discord.js"
import { config } from "../../config"
import net from "../../net"
import { getPurple, hasUrl, time } from "../../utils"

const { getPicksTemporally } = net
type FetchedBeeps = Awaited<ReturnType<typeof getPicksTemporally>>
export default (fetchedBeeps: FetchedBeeps) => {
    const purple = getPurple()
    console.log("purple", purple)
    const embeds: EmbedBuilder[] = fetchedBeeps.map(fetchedBeep => {
        const { avatar, username, title, sauce, score, published, message } = fetchedBeep
        const embed: EmbedData = {
            title,
            author: { name: username },
            url: sauce,
            thumbnail: { url: avatar as string },
            fields: [
                { name: "Message 💬", value: message, inline: true },
                { name: "Score 👌", value: score.toString(), inline: true }
            ],
            footer: {
                text: "Submitted " + time.relative(published)
            }
        }
        return new EmbedBuilder(embed).setColor(purple as ColorResolvable)
        
    })
    return embeds
}