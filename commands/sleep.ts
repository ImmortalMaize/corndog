import { SlashCommandBuilder, ChatInputCommandInteraction, ClientPresenceStatus, PermissionFlagsBits, RoleManager, GuildMemberRoleManager, TextChannel } from "discord.js";
import { Corndog } from "..";
import { channels, roles } from "../config"
import { ReadableCommand } from "../classes";
import { } from "dotenv";
import { emote, woof } from "../utils";

export default new ReadableCommand(new SlashCommandBuilder().setName("sleep").setDescription("Toggle the bot's sleep mode!").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async (interaction: ChatInputCommandInteraction) => {
    const corndog: Corndog = interaction.client;
    const { sleep } = corndog;
    const { STATUS } = process.env
    const { member } = interaction;
    const { roles: memberRoles } = member
    let valid = true
    if (memberRoles instanceof GuildMemberRoleManager) if (!memberRoles.cache.some(role => role.id === roles["server support"])) valid = false
    if (Array.isArray(memberRoles)) if (!memberRoles.includes(roles["server support"])) valid = false
    if (!valid) { interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true }); return;}
    const announcements: TextChannel = await corndog.channels.fetch(channels["announcements"]) as TextChannel
    
    if (sleep) {
        corndog.sleep = false;
        corndog.user.setStatus(STATUS as ClientPresenceStatus);
        await interaction.reply({ content: "The bot is now awake! :D", ephemeral: true });
        await announcements.send(woof() + "! Maintenance is complete (for now!) Thank you for your patience! " + emote("elated"))
    } else {
        corndog.sleep = true;
        corndog.user.setStatus("dnd")
        await interaction.reply({ content: "The bot is now sleeping! Zzz... :sleeping:", ephemeral: true });
        await announcements.send(woof() + "! I am undergoing some maintenance. In the meantime my commands won't work, so please be patient!" + emote("furry"))
    }
})