import { Message } from "discord.js";
import { hasUrl } from ".";
import { request } from "undici";

export const parseMessage = async (message: Message) => {
    const { cleanContent } = message
    const urls = cleanContent.match(hasUrl)
    const redirections = await Promise.all(urls?.map(async (url): Promise<string> => (await request(url)).headers.location as unknown as string ?? url));

    return {
        urls,
        redirections
    }
}