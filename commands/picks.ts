import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import { channels, config } from "../config";
import { TextChannel } from 'discord.js';
import utils from "../utils"
import { finishedBeep, member } from "../redis/entities";

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
    .addSubcommandGroup(
        new SlashCommandSubcommandGroupBuilder()
        .setName('set')
        .setDescription('Sets user settings for picks!')
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
            .setName('pings')
            .setDescription('Sets pings for new picks!')
            .addBooleanOption(
                option => option
                .setName("bool")
                .setDescription("Do you want pings for your latest picks?")
                .setRequired(true)
            )
        )
    ),
    async (interaction: ChatInputCommandInteraction) => {
        if (interaction.options.getSubcommandGroup() === "set") {
            const bool = interaction.options.getBoolean("bool")
            const thisMember = await member.get("id", interaction.user.id)
            if (thisMember) {
                await member.amend(thisMember.entityId, [
                    ["pings", bool]
                ])
                interaction.reply({
                    content: `Set pings to ${bool ? "on" : "off"}! ${utils.emote("elated")}`,
                    ephemeral: true
                })
            }
        }
        else {
        const scope = interaction.options.getSubcommand()
        console.log(scope)

        const backWhen = utils.time.goBack(1, scope === "yearly" ? "years" : scope === "monthly" ? "months" : "weeks")
        const picks = await finishedBeep.view()
        console.log(picks.length)
        const filteredPicks = picks.filter(pick => {
            console.log(pick.date.toDateString())
            return utils.time.convert(pick.date).unix() > backWhen.unix()
        })
        console.log(filteredPicks.length)

        const pickReactions = filteredPicks.sort((a, b) => b.count - a.count)
            .map(pick => pick.count)

        console.log(pickReactions.slice(0, 10))
        interaction.reply({
            content: "Check logs?",
            ephemeral: true
        })
    }
    })