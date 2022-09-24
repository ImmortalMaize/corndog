import { ReadableEvent } from "../classes"
import { Message } from 'discord.js';
import { channels, config } from "../config";
import utils from "../utils";

const reply = async (message: Message, content: string) => {
    const reply = await message.reply(content)
    setTimeout(async () => {
        await reply.delete()
    }, 8000)
}
export default new ReadableEvent("messageCreate", async (message: Message) => {
    if (message.author.id === config.clientId) {
        return
    }
    if (message.channel.id === channels["finished-beeps"]) {
        let bad: boolean = false
        if (message.cleanContent.length > 450) {
            bad = true
            reply(message, "The character limit is 450 or under. Yours is " + message.cleanContent.length + "! > _<")
        }
        if (message.cleanContent.match(/\n/gm)?.length >= 5) {
            bad = true
            reply(message, "Too many line breaks! > _<")
        }
        if (message.cleanContent.match(/\n/gm)?.length >= 5) {
            bad = true
            reply(message, "Too many line breaks! > _<")
        }
        if (!message.cleanContent.match(utils.hasSauce)) {
            bad = true
            reply(message, "Where's the link?! > _< (Make sure it starts with https://)")
        }
        if (!message.cleanContent.match(utils.hasSauce)?.every(
            sauce => sauce.length < 50
        )) {
            reply(message, "Shorten your link(s)...! > _<")
        }
        if (message.attachments.filter(attachment => attachment.contentType === "audio").size > 0) {
            reply(message, "Shorten your link(s)...! > _<")
        }
        if (bad) {
            setTimeout(
                async () => await message.delete(), 2000
            )
        }
    }
})