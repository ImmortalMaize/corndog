import { ReadableEvent } from "../../classes"
import { EmbedBuilder, Message } from 'discord.js';
import { channels, config, users } from "../../config";
import { hasUrl, emojis, tracer, hasSauce, hasHeaders, getMember } from "../../utils";
import { TextChannel, userMention } from 'discord.js';
import isBeepBad from "./isBeepBad";
import isUserContentBad from "./isUserContentBad";
import netty from '../../net'
import judgeForReactChannel from "./judgeForReactChannel";

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
    if (isBeepChannel) {
        const bad = await isBeepBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
        //if (bad === false) await netty.postBeep(message, message.author)
    }
    if (isUserContent) {
        const bad = await isUserContentBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
    }
})
