import { Interaction, ModalSubmitInteraction } from 'discord.js';
import { Corndog } from '..';
import { ReadableEvent } from "../classes"
import { tracer } from '../utils/';

export default new ReadableEvent('interactionCreate', async (interaction: Interaction) => {
        const corndog: Corndog = interaction.client
        const { sleep } = corndog
        // @ts-ignore
        const { commandName } = interaction
        if (sleep && commandName !== "sleep") return;

        const command = corndog.commands.get(commandName);
        tracer.command(`/${commandName}`.inverse + " by " + interaction.user)
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        try {
            await command.execute(interaction, corndog);
        } catch (error) {
            console.error(error);
            await interaction[interaction.replied?"editReply":"reply"]({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
})