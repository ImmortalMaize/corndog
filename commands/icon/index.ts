import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { ReadableCommand } from "../../classes";
import iconMap from "./map"
import { emote, woof } from "../../utils";


async function setIconRole(member: GuildMember, icon: string) {
    const iconTuple = iconMap.get(icon)
    const [requiredRole, iconRole] = iconTuple
    const iconRoles = Array.from(iconMap.values()).map(tuple => tuple[1])

    if (!icon) await member.roles.remove(iconRoles)
    if (!member.roles.cache.has(requiredRole)) return false
    
    await member.roles.remove(iconRoles)
    await member.roles.add(iconRole)
    
    return true
}

export default new ReadableCommand(new SlashCommandBuilder().setName("icon").setDescription("Set your icon!").addStringOption(option => option.setName("role").setDescription("What role do you want an icon for?").setRequired(true).setChoices(
    { name: "Hypergeek", value: "hypergeek" },
    { name: "Heckin' Typing Maniac", value: "maniac" },
    { name: "BeepBoxer Of High Society", value: "society" },
    { name: "Picked", "value": "picked"},
    { name: "Beep Bishop", value: "bishop"},
    { name: "No Icon", value: "nothing" })), async (interaction: ChatInputCommandInteraction) => {
        const { member } = interaction
        const role = interaction.options.getString("role")
        const success = await setIconRole(member as GuildMember, role === "nothing" ? null : role)
        console.log(success)

        interaction.reply({
            content: success && (role === "nothing") ? `${woof()}! Omnomnom! ${emote("furry")}` : success ? `${woof()}! Icon set! ${emote("elated")}` : `${woof()}.. you don't have the needed role for that icon. ${emote("malcontent")}`,
            ephemeral: true
        })
    })