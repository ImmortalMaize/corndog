import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { channels, config } from "../config";
import { TextChannel } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import utils from '../utils';

export default new ReadableCommand(
    new SlashCommandBuilder().setName("random").setDescription("Gets random beep.").addBooleanOption(
        option => option
        .setName("public")
        .setDescription("Do you want the result to be public?")
    ),
    async (interaction: ChatInputCommandInteraction) => {
        const isPublic = interaction.options.getBoolean("public") ?? false

        const finishedBeeps = (await interaction.guild.channels.fetch()).get(channels["finished-beeps"]) as TextChannel
        const messages = (await finishedBeeps.messages.fetch())
        const randomIndex = Math.floor(Math.random() * messages.size)
        const iterable = Array.from(messages.values())
        const randomBeep = iterable[randomIndex]
        const randomBeepAuthor = (await interaction.guild.members.fetch()).get(randomBeep.author.id)
        const count = (await randomBeep.reactions.cache.get(utils.emojis.hand)?.users.fetch()).filter(user => user.id !== randomBeepAuthor.id && user.id !== config.clientId).size
        const embed = utils.pickEmbed(randomBeep, count)
        interaction.reply({
            content: "Here's a beep by" + randomBeepAuthor,
            embeds: [embed],
            ephemeral: isPublic

        })
    })