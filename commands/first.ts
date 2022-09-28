import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import utils from '../utils';


export default new ReadableCommand(
    new SlashCommandBuilder().setName("first").setDescription("Gets first message in channel"), async (interaction: ChatInputCommandInteraction) => {
        const firstTime = (await interaction.channel.messages.fetch()).last().createdTimestamp
        interaction.reply({
            content: "The first message I could find here was from" + utils.relativeTime(firstTime),
            ephemeral: true
        })
    }
)