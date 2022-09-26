import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { channels } from "../config";
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
        const finishedPicks = (await interaction.guild.channels.fetch()).get(channels["finished-picks"]) as TextChannel

        const scope = interaction.options.getSubcommand()
        const backWhen = scope === "monthly" ? utils.goBack(1, "month") : utils.goBack(1, "week")
        const picks = (await finishedPicks.messages.fetch()).filter(message => message.createdTimestamp > backWhen).map(pick => pick.cleanContent).slice(0, 4)
        console.log(picks)

        interaction.reply({
            content: "Check logs?",
            ephemeral: true
        })
    })