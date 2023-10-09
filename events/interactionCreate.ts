import { Interaction, ModalSubmitInteraction } from 'discord.js';
import { ReadableEvent } from "../classes"
import { tracer } from '../utils/';

export default new ReadableEvent('interactionCreate', async (interaction: Interaction) => {
        // @ts-ignore
        const command = interaction.client.commands.get(interaction.commandName);
        // @ts-ignore
        tracer.command(`/${interaction.commandName}`.inverse + " by " + interaction.user)
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        try {
            await command.execute(interaction);
        } catch (error) {
            await interaction[interaction.replied?"editReply":"reply"]({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
})