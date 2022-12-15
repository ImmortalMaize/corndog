import { SlashCommandBuilder } from "@discordjs/builders";
import { ReadableCommand } from "../classes";
import { ChatInputCommandInteraction } from 'discord.js';
import { channels } from "../config";
import { TextChannel } from 'discord.js';

export default new ReadableCommand(
    new SlashCommandBuilder()
        .addUserOption(
            option => option
            .setName("user")
            .setDescription("The user to take out of context!")
            .setRequired(true)
        )
        .addBooleanOption(
            option => option
            .setName("public")
            .setDescription("Do you want this to be public?")
            .setRequired(false)
        ), async (interaction: ChatInputCommandInteraction) => {
            const user = interaction.options.getUser("user")
            const isPublic = interaction.options.getBoolean("public") ?? false

            const channel: TextChannel = Math.random() >= 0.5 ?
                (interaction.guild.channels.cache.get(channels["off-topic"]) ?? await interaction.guild.channels.fetch(channels["off-topic"])) as TextChannel :
                (interaction.guild.channels.cache.get(channels["off-topic-2"]) ?? await interaction.guild.channels.fetch(channels["off-topic-2"])) as TextChannel;

            const message = (channel.messages.cache ?? await (channel as TextChannel).messages.fetch()).filter(message => message.author.id === user.id).random()

            await interaction.reply({
                content: message.cleanContent,
                files: message.attachments.map(attachment => attachment.url),
                ephemeral: !isPublic
            })
        })