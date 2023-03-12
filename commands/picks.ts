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

        const backWhen = utils.time.goBack(1, scope === "yearly" ? "years" : scope === "monthly" ? "months" : "days")
        const picks = await finishedBeep.view()
        console.log(picks.length)
        const filteredPicks = picks.filter(pick => {
            pick.date.toDateString()
            return pick.date.valueOf() > backWhen.unix()
        })
        console.log(filteredPicks.length)
        
        const pickReactions = filteredPicks.sort((a, b) => b.count - a.count)
        .map(pick => pick.count)

        console.log(pickReactions.slice(0, 10))
        interaction.reply({
            content: "Check logs?",
            ephemeral: true
        })
    })