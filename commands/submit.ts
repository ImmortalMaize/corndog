import { ReadableCommand } from "../classes";
import { ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, InteractionResponse, hyperlink, hideLinkEmbed, ButtonBuilder, ButtonStyle, InteractionReplyOptions, ModalSubmitInteraction } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ComponentType } from 'discord.js';
import { ModalBuilder } from 'discord.js';
import { TextInputBuilder } from 'discord.js';
import { TextInputStyle } from 'discord.js';
import { Message } from 'discord.js';
import {emote, woof, startsWithVowel, getMentions, enumerate, time } from "../utils";
import isURL from "is-url"

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
            .setName('sauce')
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
        const sauce = interaction.options.getString("sauce")
        const title = interaction.options.getString("title")
        const collaborators = getMentions(interaction.options.getString("collaborators"))
        
        let selectedCategories = ["original"]
        if (!isURL(sauce)) {
            interaction.reply({
                content: `No seriously... where's the sauce? ${emote("neutral")}`,
                ephemeral: true
            })
            return
        }

        const replyToSubmission = async (interaction: ChatInputCommandInteraction|ModalSubmitInteraction) => {
        
        const undoButton = new ButtonBuilder()
            .setCustomId("undo")
            .setLabel("Undo")
            .setStyle(ButtonStyle.Primary)
        const undoActionRow = new ActionRowBuilder().addComponents(
            undoButton)
            const reply = await interaction.reply({
                content: `${woof()}! You submitted ${startsWithVowel(selectedCategories[0]) ? "an" : "a"} ${enumerate(selectedCategories)} ${(hyperlink("beep", hideLinkEmbed(sauce)))} titled ${title}${collaborators.length > 0 ? `, in collaboration with ${enumerate(collaborators, true)}!` : "!"
                    } ${emote("elated")}\n\nMade a mistake? Click the button below to undo your submission!`,
                //@ts-ignore
                components: [undoActionRow],
                ephemeral: true
            })
            
            reply.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: time.duration({ days: 1 })
            }).then((undo) => {
                interaction.deleteReply()
                undo.reply({
                    content: `Submission cancelled. You may resubmit your beep! ${emote("furry")}`,
                    ephemeral: true
                })
            })
        }

        if (interaction.options.getBoolean("original")) {
            await replyToSubmission(interaction)
            console.log(selectedCategories)
        } else {
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
                new StringSelectMenuBuilder()
                    .setCustomId("categoriesSelect")
                    .setMinValues(1)
                    .setMaxValues(categories.length)
                    .setOptions(categories)
            )

            const categoriesMenu = await interaction.reply({
                content: "What categories does your submission fall under?",
                //@ts-ignore
                components: [categoriesActionRow],
                ephemeral: true
            }) as Message

            const srcInput = new TextInputBuilder()
                .setCustomId("sauce")
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
                componentType: ComponentType.StringSelect,
            }).then(async (submission) => {
                selectedCategories = submission.values
                submission.showModal(srcModal)
            })
                .then(() => interaction.awaitModalSubmit({
                    filter: (modal) => modal.customId === "sourceModal",
                    time: 10000
                })
                    .then(submission => {
                        interaction.deleteReply()
                        replyToSubmission(submission)
                        console.log(selectedCategories)
                    }))
        }
    })