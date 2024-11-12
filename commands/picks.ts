import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import { channels, config } from "../config";
import { TextChannel } from 'discord.js';
import {woof, emote, numbers, trunk, time} from "../utils"
import { finishedBeep, member } from "../redis/entities";
import { ManipulateType } from "dayjs";
import getPicks from "../net/getPicks";

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
        .addSubcommand(
            subcommand => subcommand
                .setName("best-of")
                .setDescription("Get the top finished picks for a year.")
                .addIntegerOption(
                    option => option
                        .setName("year")
                        .setDescription("What year do you want to get the top picks for?")
                        .setRequired(true)
                )
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
                        ),
                )
                .addSubcommand(
                    new SlashCommandSubcommandBuilder()
                        .setName('scope')
                        .setDescription('Sets the scope for your picks!')
                        .addIntegerOption(
                            option => option
                                .setName("number")
                                .setDescription("How many units of time do you want to set the scope to?")
                                .setRequired(true)
                        )
                        .addStringOption(
                            option => option
                                .setName("unit")
                                .setDescription("What unit of time do you want to set the scope to?")
                                .addChoices(
                                    { name: "years", value: "year" },
                                    { name: "months", value: "month" },
                                    { name: "weeks", value: "week" },
                                    { name: "days", value: "day" },
                                )
                                .setRequired(true)
                        ))
        ),
    async (interaction: ChatInputCommandInteraction) => {
        if (interaction.options.getSubcommandGroup() === "set") {
            const thisMember = await member.get("id", interaction.user.id)

            switch (interaction.options.getSubcommand()) {
                case "pings":
                    const bool = interaction.options.getBoolean("bool")
                    if (thisMember) {
                        await member.amend(thisMember.entityId, [
                            ["picks pings", bool]
                        ])
                        interaction.reply({
                            content: `${woof()}! Set pings to ${bool ? "on" : "off"}! ${emote("elated")}`,
                            ephemeral: true
                        })
                    }
                    break;
                case "scope":
                    const number = Math.abs(interaction.options.getInteger("number"))
                    const unit = interaction.options.getString("unit", true)
                    
                    if (thisMember) {
                        await member.amend(thisMember.entityId, [
                            ["picks scope number", number],
                            ["picks scope unit", unit]
                        ])

                        interaction.reply({
                            content: `${woof()}! You won't get pings for picks older than ${numbers(number)} ${number === 1 ? unit.substring(0, unit.length-1) : unit}! ${emote("elated")}`,
                            ephemeral: true
                        })
                    }
                    break;
                default: break;
            }
        }
        if (interaction.options.getSubcommand() === "best-of") {
                interaction.deferReply({
                    ephemeral: true
                })
                const year = interaction.options.getInteger("year", true)
                const picks = (await finishedBeep.view()).filter(beep => time.between(beep.date, [time.startOf("year").subtract(1, "year").toDate(), time.startOf("year").toDate()])).sort((a, b) => b.count - a.count)
                const slicedPicks = picks.slice(0, 20)

                let leaderboard = `**Here are the top beeps for ${year}!**\n`

                for (const num in slicedPicks) {
                    const pick = slicedPicks[num]
                    leaderboard += `${+num + 1}. https://discord.com/channels/${interaction.guildId}/${channels["finished-beeps"]}/${pick.submission}\n`
                }
                interaction.editReply({
                    content: leaderboard,
                })
        }
        else {
            const unit = interaction.options.getSubcommand() === "yearly" ? "year"
            :            interaction.options.getSubcommand() === "monthly" ? "month"
            :            interaction.options.getSubcommand() === "weekly" ? "week"
            :            "day"

            const picks = await getPicks(unit)
            console.log()
            const slicedPicks = picks.slice(0, 10)
            console.log(unit)

            let leaderboard = `**Here are the top beeps for this ${unit}!**\n`

            for (const num in slicedPicks) {
                const pick = slicedPicks[num]
                
                const { author, score, sauce, caption, published } = pick
                const trunkedCaption = trunk(caption.split("\n")[0], 30)
                const datePublished = `${published.day.low}-${published.month.low}-${published.year.low}`
                
                leaderboard += `${+num + 1}. **[${datePublished}]** ${author} – ${trunkedCaption} with ${score.low} likes! (<${sauce}>)\n`
            }
            interaction.reply({
                content: leaderboard,
                ephemeral: true
            })
        }
    })
