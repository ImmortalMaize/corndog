import { SlashCommandBuilder, ChatInputCommandInteraction, ClientPresenceStatus, PermissionFlagsBits } from "discord.js";
import { Corndog } from "..";
import { ReadableCommand } from "../classes";

export default new ReadableCommand(new SlashCommandBuilder().setName("sleep").setDescription("Toggle the bot's sleep mode!").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async (interaction: ChatInputCommandInteraction) => {
    const corndog: Corndog = interaction.client;
    const { sleep } = corndog;
    const { STATUS } = process.env

    if (sleep) {
        corndog.sleep = false;
        corndog.user.setStatus(STATUS as ClientPresenceStatus);
        await interaction.reply({ content: "The bot is now awake! :D", ephemeral: true });
    } else {
        corndog.sleep = true;
        corndog.user.setStatus("dnd")
        await interaction.reply({ content: "The bot is now sleeping! Zzz... :sleeping:", ephemeral: true });
    }
})