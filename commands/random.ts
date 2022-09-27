import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction } from 'discord.js';
import { channels } from "../config";
import { TextChannel } from 'discord.js';

export default new ReadableCommand(
    new SlashCommandBuilder().setName("random").setDescription("Gets random beep."),
    async (interaction: Interaction) => {
        const finishedBeeps = (await interaction.guild.channels.fetch()).get(channels["finished-beeps"]) as TextChannel
        const messages = (await finishedBeeps.messages.fetch())
        const randomIndex = Math.floor(Math.random() * messages.size)
        const iterable = Array.from(messages.values())
        console.log(iterable[randomIndex])
    })