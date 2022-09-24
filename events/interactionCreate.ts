import { Interaction } from 'discord.js';
import { ReadableEvent } from "../classes"

export default new ReadableEvent('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        // @ts-ignore
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    })