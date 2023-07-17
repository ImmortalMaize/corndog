import { ReadableCommand } from "../classes";
import { ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, InteractionResponse, hyperlink, hideLinkEmbed } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ComponentType } from 'discord.js';
import { ModalBuilder } from 'discord.js';
import { TextInputBuilder } from 'discord.js';
import { TextInputStyle } from 'discord.js';
import { Message } from 'discord.js';
import utils from "../utils";
import isURL from 'is-url'

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
        if (!isURL(interaction.options.getString("submission"))) {
            interaction.reply({
                content: `No seriously... where's the sauce? ${utils.emote("neutral")}`,
                ephemeral: true
            })
            return
        }
        let selectedCategories = ["original"]
        const collaborators = utils.getMentions(interaction.options.getString("collaborators"))
        console.log(collaborators)
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
        const submissionMessage = (selected: string[]) => `${utils.woof()}! You submitted ${utils.startsWithVowel(selected[0]) ? "an" : "a"} ${utils.enumerate(selected)} ${(hyperlink("beep", hideLinkEmbed(interaction.options.getString("submission"))))} titled ${interaction.options.getString("title")}${collaborators.length > 0 ? `, in collaboration with ${utils.enumerate(collaborators, true)}!` : "!"
            } ${utils.emote("elated")}`
        if (interaction.options.getBoolean("original")) {
            await interaction.reply({
                content: submissionMessage(selectedCategories),
                ephemeral: true
            })
            console.log(selectedCategories)
        } else {
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
                        submission.reply({
                            content: submissionMessage(selectedCategories),
                            ephemeral: true
                        })
                        console.log(selectedCategories)
                    }))
        }
    })