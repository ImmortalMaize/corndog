import { GuildMember } from "discord.js"
import { ManipulateType } from "dayjs"
import memberInventory from "../../redis/entities/member"

interface PingsSetting { pings: boolean }
interface ScopeSetting { scope: Scope }

type Scope = [ManipulateType, number]
export default async (member: GuildMember, setting: PingsSetting | ScopeSetting) => {
    const memberInRedis = await memberInventory.get("id", member.id)
    if (!memberInRedis) throw new Error("No member found in Redis database.")
    let amendments: Parameters<typeof memberInventory.amend>[1]

    const { pings } = setting as PingsSetting
    if ("pings" in setting) amendments = [["picks pings", pings]]

    const { scope } = setting as ScopeSetting
    const [unit, number] = scope
    if ("scope" in setting) amendments = [["picks scope unit", unit], ["picks scope number", number]]

    return await memberInventory.amend(memberInRedis.entityId, amendments)
}

