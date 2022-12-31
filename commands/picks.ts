import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { channels, config } from "../config";
import { TextChannel } from 'discord.js';
import utils from "../utils"
import { finishedBeep } from "../redis/entities";

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
        .setDescription("Get finished picks for this month.")
    )
    .addSubcommand(
        subcommand => subcommand
        .setName("yearly")
        .setDescription("Get finished picks for this year.")
    )
    , async (interaction: ChatInputCommandInteraction) => {
        const finishedBeeps = (await interaction.guild.channels.fetch()).get(channels["finished-beeps"]) as TextChannel
        const scope = interaction.options.getSubcommand()

        const backWhen = utils.time.goBack(1, scope === "year" ? "year" : scope === "month" ? "month" : "week").unix()
        const picks = await Promise.all(
            (await finishedBeep.view()).map(async (beep) => await finishedBeeps.messages.fetch(beep.submission))
        )
        const pickReactions = picks.map(pick => pick.reactions.cache.get(utils.emojis.hand).count).sort((a, b) => b-a)

        console.log(pickReactions.slice(0, 10))

        interaction.reply({
            content: "Check logs?",
            ephemeral: true
        })
    })