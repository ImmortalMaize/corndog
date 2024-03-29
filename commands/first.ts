import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { time } from '../utils';


export default new ReadableCommand(
    new SlashCommandBuilder().setName("first").setDescription("Gets first message in channel"), async (interaction: ChatInputCommandInteraction) => {
        const firstTime = (await interaction.channel.messages.fetch()).last().createdTimestamp
        interaction.reply({
            content: "The first message I could find here was from" + time.relative(firstTime),
            ephemeral: true
        })
    }
)