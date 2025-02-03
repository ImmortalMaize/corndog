import { ReadableEvent } from "../../classes"
import { EmbedBuilder, Message } from 'discord.js';
import { channels, config } from "../../config";
import { hasUrl, emojis, tracer, hasSauce, hasHeaders } from "../../utils";
import { TextChannel, userMention } from 'discord.js';
import { request } from "undici";

const reply = async (message: Message, content: string) => {
    const botCommands = (await message.guild.channels.fetch()).get(channels["bot-commands"]) as TextChannel
    const reply = await botCommands.send({
        content: userMention(message.author.id) + content,
    })
    setTimeout(async () => {
        await reply?.delete()
    }, 20000)
}

async function isBeepBad(message: Message): Promise<boolean> {
    const { cleanContent, channel, attachments } = message
    const urls = cleanContent.match(hasUrl)
    if (!urls) {
        tracer.log("No link = bad!")
        await reply(message, "Where's the link?! > _< (Make sure it starts with https://)")
        return true
    }

    const redirections = await Promise.all(urls?.map(async (url): Promise<string> => (await request(url)).headers.location as unknown as string ?? url))
    tracer.info(redirections)
    const sauce = redirections.some(redirection => redirection.match(hasSauce))
    console.log(sauce)
    const linebreaks = cleanContent.match(/\n/gm)
    const channelIsRecycledBeeps = channel.id === channels["recycled-beeps"]
    const longLink = urls?.some(url => url.length > 100)
    const noAttachments = attachments.size === 0
    const tooLong = cleanContent.length > 450
    const headerFormatting = cleanContent.match(hasHeaders)

    tracer.info("New finished beep! Alright let's see...")
    
    if (tooLong) {
        tracer.log("Message length is bad.")
        await reply(message, "The character limit is 450 or under. Yours is " + message.cleanContent.length + "! > _<")
        return true
    }

    if (linebreaks?.length >= 5 && !channelIsRecycledBeeps) {
        tracer.log("Message line breaks are bad.")
        await reply(message, "Too many line breaks! > _<")
        return true
    }

    if (!sauce) {
        tracer.log("No sauce = bad!")
        await reply(message, "I ain't see no SAUCE???!!! > _< (Please link to a whitelisted mod.)")
        return true
    }

    if (longLink) {
        tracer.log("A link is too long. BAD.")
        await reply(message, "Shorten your link(s)...! > _<")
        return true
    }
    if (headerFormatting) {
        tracer.log("NO HEADERS >:(")
        await reply(message, "DON'T USE HEADERS...!!! > _<")
        return true
    }
    if (!noAttachments) {
        tracer.log("ATTACHMENTS ARE BAD!!!")
        await reply(message, "NO ATTACHMENTS RGRGHRHAAAAAAAARGRGHRGHRARHARRR...!!! > _<")
        return true
    }

    tracer.info("Looks good!")
    return false
}

async function isUserContentBad(message: Message): Promise<boolean> {
    const { attachments, cleanContent } = message
    const noAttachments = attachments.size === 0
    const urls = cleanContent.match(hasUrl)
    return !urls && noAttachments ? true : false
}

const judgeForReactChannel = (message: Message, bad: boolean) => {
    if (bad) {
        message.react(emojis.question)
        setTimeout(
            async () => await message.delete().catch(() => console.log("No message to delete!")), 8000
        )
        return
    }
    message.react(emojis.hand)
}

export default new ReadableEvent("messageCreate", async (message: Message) => {
    if (message.author.id === config.clientId) return;

    const { channel } = message
    const { id } = channel
    const isBeepChannel = (id === (channels["finished-beeps"])) || (id === (channels["recycled-beeps"])) || (id === (channels["midi-beeps"]))
    const isOffTopic = (id === (channels["off-topic"]))
    const isUserContent = (id === channels["user-content"])
    if (isBeepChannel) {
        const bad = await isBeepBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
    }
    if (isUserContent) {
        const bad = await isUserContentBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
    }
})
