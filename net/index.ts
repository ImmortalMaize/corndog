import { User, Message } from "discord.js";
import { BeepDto, UserDto } from "./interfaces";
import { request } from "undici";
import { hasSauce, hasUrl, parseMessage, time } from "../utils";

class Netty {
    public dataURL: string = process.env["DATA_URL"]
    convertUser(user: User): UserDto {
        return {
            discordId: user.id,
            username: user.username
        }
    }

    private async convertBeep(message: Message): Promise<BeepDto> {
        const { content, id, createdTimestamp } = message
        const { redirections } = await parseMessage(message)
        const sauce = redirections.filter(redirection => redirection.match(hasSauce))[0]
        console.log(sauce)
        const messageWithoutUrls = content.replaceAll(hasUrl, "").replaceAll(/[\*\_\~\`]*/gm, "")
        const firstLineBreak = messageWithoutUrls.search(/\n/gm)
        let title: string = messageWithoutUrls.trim()
        let blurb: string | undefined
        if (firstLineBreak !== -1) {
            title = messageWithoutUrls.slice(0, firstLineBreak).trim()
            blurb = messageWithoutUrls.slice(firstLineBreak + 1, messageWithoutUrls.length).trim()
        }
        if (!title) title = "untitled " + time.now().format("YYYY.MM.DD")
        console.log(title)
        return { sauce, blurb, title, discordId: id, published: createdTimestamp }
    }

    public async postBeep(beep: Message, author: User) {
        return await request(this.dataURL + "bot/postBeep", {
            method: "POST",
            headers: ["Content-Type", "application/json"],
            body: JSON.stringify({beep: await this.convertBeep(beep), author: this.convertUser(author)})
        })
    }

    public async likeBeep(beep: Message, author: User, likers: User[]) {
        return await request(this.dataURL + "bot/likeBeep", {
            method: "POST",
            headers: ["Content-Type", "application/json"],
            body: JSON.stringify({beep: await this.convertBeep(beep), author: this.convertUser(author), likers: likers.map(liker => this.convertUser(liker))})
        })
    }
}

export default new Netty()