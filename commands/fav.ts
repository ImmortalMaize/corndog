import { ReadableCommand } from "../classes";
import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle} from 'discord.js';

export default new ReadableCommand(
    new SlashCommandBuilder().setName("fav").setDescription("Set a bookmark."),
    async (interaction) => {
        const favModal = new ModalBuilder()
        .setCustomId('fav')
        .setTitle("Set Bookmark")

        const sauceInput = new TextInputBuilder()
        .setCustomId("sauce")
        .setLabel("What's the sauce?")
        .setStyle(TextInputStyle.Short)

        const descInput = new TextInputBuilder()
        .setCustomId("desc")
        .setLabel("What's the description?")
        .setStyle(TextInputStyle.Short)

        const row1 = new ActionRowBuilder().addComponents(sauceInput)
        const row2 = new ActionRowBuilder().addComponents(descInput)

        //@ts-ignore
        favModal.addComponents(row1, row2)
        //@ts-ignore
        await interaction.showModal(favModal)
    }
)