import { ReadableEvent } from "../../classes"
import { EmbedBuilder, Message } from 'discord.js';
import { channels, config, users } from "../../config";
import { hasUrl, emojis, tracer, hasSauce, hasHeaders } from "../../utils";
import { TextChannel, userMention } from 'discord.js';
import { request } from "undici";
import isBeepBad from "./isBeepBad";
import isUserContentBad from "./isUserContentBad";
import isOpusBad from "./isMagnumOpusBad";

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

const judgeForReactMagnumOpus = (message: Message, bad: boolean) => {
    if (bad) {
        message.react(emojis.question)
        setTimeout(
            async () => await message.delete().catch(() => console.log("No message to delete!")), 8000
        )
        return
    }
    // insert code here to add users to the database
    message.react(emojis.hand)
}

export default new ReadableEvent("messageCreate", async (message: Message) => {
    if (message.author.id === config.clientId) return;
    const { channel } = message
    if (channel.isThread()) {
        if (channel.parentId === channels["critique"]) message.react(emojis.hand)
    }
    const { id } = channel
    const isBeepChannel = (id === (channels["finished-beeps"])) || (id === (channels["recycled-beeps"])) || (id === (channels["midi-beeps"]))
    const isOffTopic = (id === (channels["off-topic"]))
    const isUserContent = (id === channels["user-content"])
    const isMagnumOpus = (id === channels["magnum-opus"]);
    if (isBeepChannel) {
        const bad = await isBeepBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
    }
    if (isMagnumOpus) {
        const bad = await isOpusBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
    } 
    /* Right now it says isBeepBad() but I'm gonna make a different event that also gets the user ID of the person posting AND the timer relating to that user's ID.
    
    */
    if (isUserContent) {
        const bad = await isUserContentBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
    }
})
