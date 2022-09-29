import { ActionRowBuilder, ApplicationCommandType, ComponentType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ReadableCommand } from "../classes";

export default new ReadableCommand(
    new ContextMenuCommandBuilder()
    .setName("Bookmark")
    .setType(ApplicationCommandType.Message),
    async (interaction: ContextMenuCommandInteraction) => {
        const favModal = new ModalBuilder()
        .setCustomId('fav')
        .setTitle("Bookmarks")

        const nameInput = new TextInputBuilder()
        .setLabel("Name")
        .setStyle(TextInputStyle.Short)
        .setCustomId("name")

        const sauceInput = new TextInputBuilder()
        .setLabel("Sauce")
        .setStyle(TextInputStyle.Paragraph)
        .setCustomId("sauce")

        const sauceRow = new ActionRowBuilder().addComponents(sauceInput)
        const nameRow = new ActionRowBuilder().addComponents(nameInput)

        //@ts-ignore
        favModal.addComponents(sauceRow, nameRow)

        await interaction.showModal(favModal)
    }
)