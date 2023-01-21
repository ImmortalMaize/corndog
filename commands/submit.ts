import { ReadableCommand } from "../classes";
import { ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder, InteractionResponse } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ComponentType } from 'discord.js';
import { ModalBuilder } from 'discord.js';
import { TextInputBuilder } from 'discord.js';
import { TextInputStyle } from 'discord.js';
import { Message } from 'discord.js';

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

        .addBooleanOption(
            option => option
                .setName('original')
                .setDescription('Is this an original submission?')
                .setRequired(true)
        )
        .addStringOption(option => option
            .setName('collaborators')
            .setDescription('Who did you collab with?')
            .setRequired(false)
        ),

    async (interaction: ChatInputCommandInteraction) => {

        const categories = [
            { label: "Cover", value: "cover" },
            { label: "Remix", value: "remix" },
            { label: "Remake", value: "remake" },
            { label: "Guided", value: "guided" },
            { label: "Recycled", value: "recycled" },
            { label: "Edit", value: "edit" },
            { label: "Midi", value: "midi" }
        ]
        const categoriesActionRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId("categoriesSelect")
                .setMinValues(1)
                .setMaxValues(categories.length)
                .setOptions(categories)
        )
        if (interaction.options.getBoolean("original")) {
            await interaction.reply({
                content: "Submitted! ^w^",
                ephemeral: true
            })
        } else {
            const categoriesMenu = await interaction.reply({
                content: "What categories does your submission fall under?",
                //@ts-ignore
                components: [categoriesActionRow],
                ephemeral: true
            }) as Message

            const srcInput = new TextInputBuilder()
                .setCustomId("sourceInput")
                .setLabel("Sauce")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Where did you find the original?")
                .setRequired(true)

            const srcRow = new ActionRowBuilder().addComponents(srcInput)

            const srcModal = new ModalBuilder()
                .setCustomId("sourceModal")
                .setTitle("Submission")
                //@ts-ignore
                .addComponents(srcRow)


            await categoriesMenu.awaitMessageComponent({
                componentType: ComponentType.SelectMenu,
            }).then(async (submission) => {
                submission.showModal(srcModal)
                return await interaction.awaitModalSubmit({
                    filter: (modal) => modal.customId === "sourceModal",
                    time: 360000 })
                .then(async (submission) => {
                return await submission.reply({
                    content: "Submitted! ^w^",
                    ephemeral: true
                })
                .catch(() => {
                        return interaction.reply({
                            content: "Whoops... please try again! ^~^",
                            ephemeral: true
                        })
                })
            })
            })

            
        }
    })