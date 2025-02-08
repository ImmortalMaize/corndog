import { ThreadChannel } from "discord.js";
import { ReadableEvent } from "../classes";
import { channels } from "../config";
import { emojis, emote, woof } from "../utils";
import { Corndog } from "..";

export default new ReadableEvent('threadCreate', async (thread: ThreadChannel) => {
    const channel = thread.parent
    const isCritique = channel.id === channels["critique"]
    const { client } = thread;
    (client as Corndog).socket.emit("newCreq", {
        user: thread.ownerId,
        tags: thread.appliedTags
    })
    if (isCritique) thread.sendTyping().then(() => thread.send(`${woof()}! Thanks for your submission! There's gonna be peeps helping you out soon. If you find what they say helpful, leave them a ${emojis.hand}! That'll give them credit in our system! ${emote("content")}\n\n**Keep in mind! After three days, if you have marked a post as helpful, the thread will close in 24 hours unless there's further discussion. All threads close a week after their creation.**`))
    
    })