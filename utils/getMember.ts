import { GuildMemberManager } from "discord.js";

export const getMember = async (members: GuildMemberManager, id: string) => members.cache.get(id) ?? await members.fetch(id)