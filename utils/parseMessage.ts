import { Message } from "discord.js";
import { hasUrl } from ".";
import { request } from "undici";

interface ParsedMessage {
    url: string
    redirection: string
}
export const parseMessage = async (message: Message) => {
    const { cleanContent } = message
    const urls = cleanContent.match(hasUrl)
    const parsedMessages = await Promise.all(urls?.map(async (url): Promise<ParsedMessage> => ({
        url,
        redirection: (await request(url)).headers.location as unknown as string ?? url
    })))

    return parsedMessages
}