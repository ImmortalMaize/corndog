import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { channels, config } from "../config";
import { TextChannel } from 'discord.js';
import utils from "../utils"

export default new ReadableCommand(
    new SlashCommandBuilder()
    .setName("picks")
    .setDescription("Get more information on finished picks.")
    .addSubcommand(
        subcommand => subcommand
        .setName("weekly")
        .setDescription("Get finished picks for this week.")
    )
    .addSubcommand(
        subcommand => subcommand
        .setName("monthly")
        .setDescription("Get finished picks for this week.")
    )
    , async (interaction: ChatInputCommandInteraction) => {
        const finishedPicks = (await interaction.guild.channels.fetch()).get(channels["finished-beeps"]) as TextChannel

        const scope = interaction.options.getSubcommand()
        const backWhen = scope === "monthly" ? utils.goBack(1, "month") : utils.goBack(1, "week")
        const picks = (await finishedPicks.messages.fetch()).filter(message => message.createdTimestamp > backWhen).map(pick => pick)
        const pickReactions = picks.map(async (pick) => ({content: pick.cleanContent, reactions: ( await pick.reactions.cache.get(utils.hand).users.fetch()).filter(user => user.id !== pick.author.id && user.id !== config.clientId).size}))
        console.log(pickReactions.slice(0, 5))

        interaction.reply({
            content: "Check logs?",
            ephemeral: true
        })
    })