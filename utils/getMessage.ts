import { MessageManager } from "discord.js";

export const getMessage = async (messages: MessageManager, id: string) => messages.cache.get(id) ?? await messages.fetch(id)