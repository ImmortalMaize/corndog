import { ReadableEvent } from "../classes"
import { EmbedBuilder, Message } from 'discord.js';
import { channels, config } from "../config";
import utils from "../utils";
import { TextChannel, userMention } from 'discord.js';
import { request } from "undici";

export default new ReadableEvent("messageCreate", async (message: Message) => {
    const reply = async (message: Message, content: string) => {
        const botCommands = (await message.guild.channels.fetch()).get(channels["bot-commands"]) as TextChannel
        const reply = await botCommands.send({
            content: userMention(message.author.id) + content,
            // embeds: [new EmbedBuilder().setDescription(message.content).setAuthor({ name: message.author.username, iconURL: message.author.avatarURL()})]
        })
        setTimeout(async () => {
            await reply?.delete()
        }, 20000)
    }

    if (message.author.id === config.clientId) {
        return
    }

    if ((message.channel.id === (channels["finished-beeps"]))||(message.channel.id === (channels["recycled-beeps"]))||(message.channel.id === (channels["midi-beeps"]))) {
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
        if (!message.cleanContent.match(utils.hasSauce)) {
            console.log("No link = bad!")
            bad = true
            await reply(message, "Where's the link?! > _< (Make sure it starts with https://)")
        } else {
            console.log("There's a link... Okay.")
            if (!message.cleanContent.match(utils.hasSauce).every(
                sauce => sauce.length < 100
            )) {
                console.log("The link is too long. BAD.")
                bad = true
                await reply(message, "Shorten your link(s)...! > _<")
            }
        }

        if (message.attachments.size > 0) {
            console.log("ATTACHMENTS ARE BAD!!!")
            bad = true
            reply(message, "Shorten your link(s)...! > _<")
        }
        if (bad) {
            message.react(utils.emojis.question)
            setTimeout(
                async () => await message.delete().catch(() => console.log("No message to delete!")), 8000
            )
        } else {
            const m = message.cleanContent.match(utils.hasSauce)[0]
            message.react(utils.emojis.hand)
            request('http://localhost:3000/content/beep/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "sauce": m,
                    "discordId": message.id,
                    "authors": [message.author.id],
                    "sheets": ["community"],
                    "basedOn": []
                })
            })
        }
    }
})