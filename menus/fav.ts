import { ActionRowBuilder, ApplicationCommandType, ComponentType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ReadableCommand } from "../classes";
import { fav } from '../redis/entities';

export default new ReadableCommand(
    new ContextMenuCommandBuilder()
        .setName("Bookmark")
        .setType(ApplicationCommandType.Message),
    async (interaction: ContextMenuCommandInteraction) => {
        const message = (await interaction.channel.messages.fetch()).get(interaction.targetId)

        const favModal = new ModalBuilder()
            .setCustomId('favModal')
            .setTitle("Set A Bookmark")

        const nameInput = new TextInputBuilder()
            .setLabel("Name")
            .setStyle(TextInputStyle.Short)
            .setCustomId("name")

        const sauceInput = new TextInputBuilder()
            .setLabel("Sauce")
            .setStyle(TextInputStyle.Paragraph)
            .setCustomId("sauce")
            .setValue(message.content)

        const sauceRow = new ActionRowBuilder().addComponents(sauceInput)
        const nameRow = new ActionRowBuilder().addComponents(nameInput)

        //@ts-ignore
        favModal.addComponents(sauceRow, nameRow)

        await interaction.showModal(favModal).then(async () => {interaction.awaitModalSubmit({
            filter: (modal) => modal.customId === "favModal",
            time: 60000
        }).then(async modal => {
            const sauce = modal.fields.getTextInputValue("sauce")
            const name = modal.fields.getTextInputValue("name")

            //@ts-ignore
            fav.generate({
                user: interaction.user.id,
                sauce,
                name
            })

            modal.reply({
                ephemeral: true,
                content: "Okay! I saved " + sauce + " as " + name + "! ^_^"
            })
        })})
    }
)