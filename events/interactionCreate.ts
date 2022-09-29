import { Interaction, ModalSubmitInteraction } from 'discord.js';
import { ReadableEvent } from "../classes"

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
})