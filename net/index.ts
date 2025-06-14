import { User, Message } from "discord.js";
import { BeepDto, UserDto } from "./interfaces";
import { request } from "undici";
import { hasSauce, hasUrl, parseMessage, time } from "../utils";
interface FetchedBeep {
    rank?: number,
    message?: string,
    avatar?: string,
    username: string,
    title: string,
    blurb: string,
    discordId: string,
    published: number,
    sauce: string,
    score: number
}

interface FetchedBeep {
    title: string,
    blurb: string,
    discordId: string,
    published: number,
    sauce: string,
    score: number,
    username: string,
    rank?: number,
    message?: string,
    avatar?: string
}

class Fetch {
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
            body: JSON.stringify({ beep: await this.convertBeep(beep), author: this.convertUser(author) })
        })
    }

    public async likeBeep(beep: Message, author: User, likers: User[]) {
        const convertedBeep = await this.convertBeep(beep)
        const convertedAuthor = this.convertUser(author)
        return await request(this.dataURL + "bot/likeBeep", {
            method: "POST",
            headers: ["Content-Type", "application/json"],
            body: JSON.stringify({ beep: convertedBeep, author: convertedAuthor, likers: likers.map(liker => this.convertUser(liker)) })
        })
    }

    public async getPicksTemporally(after: Date, before?: Date) {
        const body = {
            after: time.convert(after).toISOString(),
            before: before ? time.convert(before).toISOString() : undefined
        }
        const response = await request(this.dataURL + "bot/getPicksTemporally", {
            method: "POST",
            headers: ["Content-Type", "application/json"],
            body: JSON.stringify(body)
        })

        return response.body.json() as unknown as FetchedBeep[]
    }

    async getBeepById(id: string) {
        return await request(this.dataURL + "content/beep/discordId/" + id, {
            method: "GET"
        }) as unknown as FetchedBeep
    }

    async updateBeepTitle(id: string, title: string) {
        return await request(this.dataURL + "bot/updateTitle", {
            method: "POST",
            headers: ["Content-Type", "application/json"],
            body: JSON.stringify({ discordId: id, title })
        })
    }

    async updateBeep(beep: Message, author: User) {
        const convertedBeep = await this.convertBeep(beep)
        const convertedAuthor = this.convertUser(author)
        return await request(this.dataURL + "bot/updateBeep", {
            method: "POST",
            headers: ["Content-Type", "application/json"],
            body: JSON.stringify({ beep: convertedBeep, author: convertedAuthor })
        })
    }
}

export default new Fetch()