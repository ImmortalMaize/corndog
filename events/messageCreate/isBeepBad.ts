import { Message, TextChannel, userMention } from "discord.js"
import { channels } from "../../config"
import { hasHeaders, hasSauce, hasUrl, tracer } from "../../utils"
import { request } from "undici"

const reply = async (message: Message, content: string) => {
    const botCommands = (await message.guild.channels.fetch()).get(channels["bot-commands"]) as TextChannel
    const reply = await botCommands.send({
        content: userMention(message.author.id) + content,
    })
    setTimeout(async () => {
        await reply?.delete()
    }, 20000)
}

export default async function isBeepBad(message: Message): Promise<boolean> {
    const { cleanContent, channel, attachments } = message
    console.log(attachments.map(attachment => attachment.contentType))
    console.log(cleanContent)
    const urls = cleanContent.match(hasUrl)
    if (!urls) {
        tracer.log("No link = bad!")
        await reply(message, "Where's the link?! > _< (Make sure it starts with https://)")
        return true
    }

    const redirections = await Promise.all(urls?.map(async (url): Promise<string> => (await request(url)).headers.location as unknown as string ?? url))
    tracer.info(cleanContent)
    tracer.info(redirections)
    const sauce = redirections.some(redirection => redirection.match(hasSauce))
    console.log(sauce)
    const linebreaks = cleanContent.match(/\n/gm)
    const channelIsRecycledBeeps = channel.id === channels["recycled-beeps"]
    const longLink = urls?.some(url => url.length > 100)

    // checks if submission has one image or less, and if that image is 64x64 or less
    const oneAttachmentOrLess = attachments.size <= 1
    const attachmentReqs = attachments.size === 0 ? true : attachments.every(attachment => attachment.contentType.match(/image\/.+/g) ? attachment.height <= 64 : attachment.contentType.match(/audio\/.+/g))
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
    if (!oneAttachmentOrLess) {
        tracer.log("ATTACHMENTS ARE BAD!!!")
        await reply(message, "TOO MANY ATTACHMENTS ATTACHMENTS RGRGHRHAAAAAAAARGRGHRGHRARHARRR...!!! > _<")
        return true
    }

    if (!attachmentReqs) {
        tracer.log("Attachments don't fulfill requirements.")
        await reply(message, "Image taller than 64px or no image or audio file detected...!! > _<")
    }

    tracer.info("Looks good!")
    return false
}