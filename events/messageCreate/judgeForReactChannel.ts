import { Message } from "discord.js"
import { emojis } from "../../utils"

export default (message: Message, bad: boolean) => {
    if (bad) {
        message.react(emojis.question)
        setTimeout(
            async () => await message.delete().catch(() => console.log("No message to delete!")), 8000
        )
        return
    }
    message.react(emojis.hand)
}