import { ReadableEvent } from "../classes";
import { GuildMember } from 'discord.js';
import { member } from "../redis/entities/";

export default new ReadableEvent("guildMemberUpdate", async (old: GuildMember, neuf: GuildMember) => {
    const newRoles = neuf.roles.cache.map(role => role.id)
    const user = await member.get("id", neuf.id) ?? 
    //@ts-ignore
    await member.generate({
        id: neuf.id,
        roles: newRoles
    })

    if (user) {
        await member.amend(user.entityId, [
            ["roles", newRoles]
        ])
    }
})