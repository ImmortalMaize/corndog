import { ReadableCommand } from "../classes";
import { ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';

export default new ReadableCommand(
    new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submit a beep to the sheet!")
    .addStringOption(
        option => option
        .setName('title')
        .setDescription('What is the title of your submission?')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('submission')
        .setDescription('What is the link to your submission?')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('collaborators')
        .setDescription('Who did you collab with?')
        .setRequired(false)
    )
    .addBooleanOption(
        option => option
        .setName('original')
        .setDescription('Is this an original submission?')
        .setRequired(true)
    ),

    async (interaction: ChatInputCommandInteraction) => {
            const categories = new ActionRowBuilder().addComponents(
                new SelectMenuBuilder()
                .setCustomId("categories")
                .setMinValues(1)
                .setOptions([
                { label: "Cover", value: "cover" },
                { label: "Remix", value: "remix" },
                { label: "Remake", value: "remake" },
                { label: "Guided", value: "guided" },
                { label: "Recycled", value: "recycled" },
                { label: "Edit", value: "edit" },
                { label: "Midi", value: "midi" }
                ])
            )
            
            interaction.reply({
                content: "What categories does your submission fall under?",
                //@ts-ignore
                components: [categories],
                ephemeral: true
            })
        })