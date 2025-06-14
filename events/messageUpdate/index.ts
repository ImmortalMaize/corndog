import { Message } from "discord.js";
import { ReadableEvent } from "../../classes";
import { channels, config } from "../../config";
import { emojis, tracer } from "../../utils";
import isBeepBad from "../messageCreate/isBeepBad";
import judgeForReactChannel from "../messageCreate/judgeForReactChannel";
import fetch from "../../net";

export default new ReadableEvent("messageUpdate", async (_, message: Message) => {
    if (message.author.id === config.clientId) return;
    const { channel } = message
    const { id } = channel
    const isBeepChannel = (id === (channels["finished-beeps"])) || (id === (channels["recycled-beeps"])) || (id === (channels["midi-beeps"]))
    if (isBeepChannel) {
        console.log("Message updated in beep channel:", id);
        const bad = await isBeepBad(message).catch((err) => {
            tracer.error(err)
            return false
        })
        judgeForReactChannel(message, bad)
        if (bad === false) {
            console.log("Updating beep in netty");
            await fetch.updateBeep(message, message.author)
        }
    }
})
