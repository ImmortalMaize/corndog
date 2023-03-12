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
        const scope = interaction.options.getSubcommand()
        console.log(scope)

        const backWhen = utils.time.goBack(1, scope === "yearly" ? "years" : scope === "monthly" ? "months" : "days").unix()
        const picks = await finishedBeep.view()
        console.log(backWhen)
        const pickReactions = picks
        .filter(pick => pick.date.valueOf() < backWhen)
        .sort((a, b) => b.count - a.count)
        .map(pick => pick.count)

        console.log(pickReactions.slice(0, 10))

        interaction.reply({
            content: "Check logs?",
            ephemeral: true
        })
    })