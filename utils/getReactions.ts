import { Message } from "discord.js"

export const getReactions = (message: Message, reaction: string) => message.reactions.cache.get(reaction) ?? message.reactions.resolve(reaction)