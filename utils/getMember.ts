import { GuildMember, GuildMemberManager } from "discord.js";

export const getMember = async (members: GuildMemberManager, id: string): Promise<GuildMember> => members.cache.get(id) ?? await members.fetch({
    user: id
})