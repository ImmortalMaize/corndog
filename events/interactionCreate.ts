import { Interaction, ModalSubmitInteraction } from 'discord.js';
import { ReadableEvent } from "../classes"

export default new ReadableEvent('interactionCreate', async (interaction: Interaction) => {
        // @ts-ignore
        const command = interaction.client.commands.get(interaction.commandName);
        console.log(interaction.isModalSubmit())
        console.log(interaction.isChatInputCommand())

        if (!command) return;

    if (interaction.isChatInputCommand()) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

    if (interaction.isModalSubmit()) {
        const modalInteraction = interaction as ModalSubmitInteraction
        console.log(interaction)

        const sauce = modalInteraction.fields.getTextInputValue("sauce")
        const description = modalInteraction.fields.getTextInputValue("desc")

        modalInteraction.reply({
            ephemeral: true,
            content: sauce + ", " + description
        })
    }
    })