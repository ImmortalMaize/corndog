import { Interaction, ModalSubmitInteraction } from 'discord.js';
import { ReadableEvent } from "../classes"
import { fav } from '../redis/entities';

export default new ReadableEvent('interactionCreate', async (interaction: Interaction) => {
        // @ts-ignore
        const command = interaction.client.commands.get(interaction.commandName);
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

    if (interaction.isModalSubmit()) {
        const modalSubmitInteraction = interaction as ModalSubmitInteraction
        const sauce = modalSubmitInteraction.fields.getField("sauce")
        const name = modalSubmitInteraction.fields.getField("name")

        fav.generate({
            user: interaction.user.id,
            sauce,
            name
        })
    }
})