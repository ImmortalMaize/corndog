import { ReadableEvent } from "../classes"
import { EmbedBuilder, Message } from 'discord.js';
import { channels, config } from "../config";
import { hasSauce, emojis, tracer} from "../utils";
import { TextChannel, userMention } from 'discord.js';

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
    tracer.info("New finished beep! Alright let's see...")
    if (message.cleanContent.length > 450) {
        tracer.log("Message length is bad.")
        await reply(message, "The character limit is 450 or under. Yours is " + message.cleanContent.length + "! > _<")
        return true
    }
    if (message.cleanContent.match(/\n/gm)?.length >= 5 && !(message.channel.id === (channels["recycled-beeps"]))) {
        tracer.log("Message line breaks are bad.")
        await reply(message, "Too many line breaks! > _<")
        return true
    }
    if (!message.cleanContent.match(hasSauce)) {
        tracer.log("No link = bad!")
        await reply(message, "Where's the link?! > _< (Make sure it starts with https://)")
        return true
    }
        if (!message.cleanContent.match(hasSauce)?.every(
                sauce => sauce.length < 100
        )) {
            tracer.log("The link is too long. BAD.")
            await reply(message, "Shorten your link(s)...! > _<")
            return true
        }
    if (message.attachments.size > 0) {
        tracer.log("ATTACHMENTS ARE BAD!!!")
        await reply(message, "NO ATTACHMENTS RGRGHRHAAAAAAAARGRGHRGHRARHARRR...!!! > _<")
        return true
    }
    return false
}

export default new ReadableEvent("messageCreate", async (message: Message) => {
    if (message.author.id === config.clientId) return;

    const { channel } = message
    const { id } = channel
    const isBeepChannel = (id === (channels["finished-beeps"]))||(id === (channels["recycled-beeps"]))||(id === (channels["midi-beeps"]))
    if (isBeepChannel) {
        const bad = await isBeepBad(message).catch(() => true)
        if (bad) {
            message.react(emojis.question)
            setTimeout(
                async () => await message.delete().catch(() => console.log("No message to delete!")), 8000
            )
            return
        }
        message.react(emojis.hand)
    }
})