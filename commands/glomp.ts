import { ChatInputCommandInteraction, SlashCommandBuilder, userMention, User } from "discord.js";
import { ReadableCommand } from "../classes";
import { emote } from "../utils";

export default new ReadableCommand(new SlashCommandBuilder().setName("glomp").setDescription("Glomp someone! >:3c").addUserOption(option => option.setName("victim").setDescription("Victim to glomp!").setRequired(true)).addBooleanOption(option => option.setName("ping").setDescription("Should I ping them?")), async (interaction: ChatInputCommandInteraction) => {
    const { id, username } = interaction.options.getUser("victim", true);
    const ping = interaction.options.getBoolean("ping", false);
    await interaction.reply(`\\*glomps ${ping ? userMention(id) : username}\\* ${emote("glomp")}`);
})
