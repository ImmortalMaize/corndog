import { SlashCommandBuilder } from "@discordjs/builders";
import { ReadableCommand } from "../classes";
import { ChatInputCommandInteraction } from 'discord.js';
import { channels } from "../config";
import { TextChannel } from 'discord.js';

export default new ReadableCommand(
    new SlashCommandBuilder()
        .setName("ooc")
        .setDescription("Gets a message out of context from a member in the off-topic channels!")
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
            console.log("User: " + user.username)

            const isPublic = interaction.options.getBoolean("public") ?? false

            const channel: TextChannel = Math.random() >= 0.5 ?
                (await interaction.guild.channels.fetch(channels["off-topic"])) as TextChannel :
                (await interaction.guild.channels.fetch(channels["off-topic-2"])) as TextChannel;
            console.log(`I choose ${channel.name}!`)

            const messages = await channel.messages.fetch()
            console.log(`Drawing from ${messages.size}!`)

            const message = messages.filter(message => message.author.id === user.id).random()
            console.log(message ? "Message found: " + message.cleanContent : "No message found! :(")
            await interaction.reply({
                content: message?.cleanContent ?? "Hm... I couldn't find any messages from that user. ;w;",
                files: message?.attachments.map(attachment => attachment.url),
                ephemeral: !isPublic
            })
        })