import { ReadableEvent } from "../classes"
import { EmbedBuilder, Message } from 'discord.js';
import { channels, config } from "../config";
import { hasSauce, emojis} from "../utils";
import { TextChannel, userMention } from 'discord.js';
import { addBeep } from "../net";

const reply = async (message: Message, content: string) => {
        const botCommands = (await message.guild.channels.fetch()).get(channels["bot-commands"]) as TextChannel
        const reply = await botCommands.send({
            content: userMention(message.author.id) + content,
        })
        setTimeout(async () => {
            await reply?.delete()
        }, 20000)
    }

async function validateBeep(message: Message): Promise<boolean> {
    console.log("New finished beep! Alright let's see...")
    let bad: boolean = false
    if (message.cleanContent.length > 450) {
        console.log("Message length is bad.")
        bad = true
        await reply(message, "The character limit is 450 or under. Yours is " + message.cleanContent.length + "! > _<")
    }
    if (message.cleanContent.match(/\n/gm)?.length >= 5 && !(message.channel.id === (channels["recycled-beeps"]))) {
        console.log("Message line breaks are bad.")
        bad = true
        await reply(message, "Too many line breaks! > _<")
    }
    if (!message.cleanContent.match(hasSauce)) {
        console.log("No link = bad!")
        bad = true
        await reply(message, "Where's the link?! > _< (Make sure it starts with https://)")
    }
        if (!message.cleanContent.match(hasSauce).every(
                sauce => sauce.length < 100
        )) {
            console.log("The link is too long. BAD.")
            bad = true
            await reply(message, "Shorten your link(s)...! > _<")
        }
    if (message.attachments.size > 0) {
        console.log("ATTACHMENTS ARE BAD!!!")
        bad = true
        reply(message, "Shorten your link(s)...! > _<")
    }
    return bad
}

export default new ReadableEvent("messageCreate", async (message: Message) => {
    if (message.author.id === config.clientId) return;

    const { channel } = message
    const { id } = channel
    const isBeepChannel = (id === (channels["finished-beeps"]))||(id === (channels["recycled-beeps"]))||(id === (channels["midi-beeps"]))
    if (isBeepChannel) {
        const bad = await validateBeep(message)
        if (bad) {
            message.react(emojis.question)
            setTimeout(
                async () => await message.delete().catch(() => console.log("No message to delete!")), 8000
            )
            return
        }
        await addBeep(message)
    }
})