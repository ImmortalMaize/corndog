import { BaseMessageOptions, GuildMember, roleMention, User, userMention } from "discord.js"
import { roles } from "../../config"
import { reportEmbed } from "../../utils"

export default (link: string, message: string, user: GuildMember|User, mod?: string): BaseMessageOptions => {
    let content = `${roleMention(roles.moderator)} Users flagged a post in ${link}! `
    if (mod) content += `${mod.split(" ").map(m => userMention(m))} took a look. `

    return {
        content,
        embeds: [reportEmbed(user instanceof GuildMember ? user.user : user, message)]
    }
}