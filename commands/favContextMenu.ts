import { ActionRowBuilder, ApplicationCommandType, ComponentType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ReadableCommand } from "../classes";

export default new ReadableCommand(
    new ContextMenuCommandBuilder()
    .setName("Bookmark")
    .setType(ApplicationCommandType.Message),
    async (interaction: ContextMenuCommandInteraction) => {
        const nameInput = new TextInputBuilder()
        .setLabel("Name")
        .setStyle(TextInputStyle.Short)
        .setCustomId("name")

        const sauceInput = new TextInputBuilder()
        .setLabel("Sauce")
        .setStyle(TextInputStyle.Paragraph)
        .setCustomId("sauce")
        .setValue("")

        const sauceRow = new ActionRowBuilder().addComponents()
        const nameRow = new ActionRowBuilder().addComponents(nameInput)


        const favModal = new ModalBuilder()
        .setCustomId("fav")
        //@ts-ignore
        .addComponents(nameRow)
        interaction.showModal(favModal)

        await interaction.awaitModalSubmit({
            componentType: ComponentType["TextInput"],
            time: 60 * 1000
        })
    }
)