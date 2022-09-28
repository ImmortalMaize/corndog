import { ReadableCommand } from "../classes";
import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction } from 'discord.js';

export default new ReadableCommand(
    new SlashCommandBuilder().setName("fav")
    .setDescription("Set a bookmark.")
    .addStringOption(
        option => option
        .setName("sauce")
        .setDescription("What's the sauce?")
        .setRequired(true)
    )
    .addStringOption(
        option => option.setName("name")
        .setDescription("What's the name?")
        .setRequired(true)
    ),
    async (interaction: ChatInputCommandInteraction) => {
        const sauce = interaction.options.getString("sauce")
        const name = interaction.options.getString("name")

        interaction.reply({
            content: name + ", " + sauce,
            ephemeral: true
        })
    }
)