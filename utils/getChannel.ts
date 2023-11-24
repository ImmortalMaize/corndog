import { GuildChannelManager } from "discord.js";

export const getChannel = async (channels: GuildChannelManager, id: string) => channels.cache.get(id) ?? await channels.fetch(id)