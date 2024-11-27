import { BaseMessageOptions, roleMention, User, userMention } from "discord.js"
import { roles } from "../../config"
import { reportEmbed } from "../../utils"

export default (link: string, message: string, user: User, mod?: string): BaseMessageOptions => {
    let content = `${roleMention(roles.management)} Users flagged a post in ${link}! `
    if (mod) content += `${mod.split(" ").map(m => userMention(m))} took a look. `
    return {
        content,
        embeds: [reportEmbed(user, message)]
    }
}