import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import { channels, config } from "../config";
import { TextChannel } from 'discord.js';
import utils from "../utils"
import { finishedBeep, member } from "../redis/entities";
import { EmbedBuilder } from 'discord.js';
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
                                    { name: "years", value: "years" },
                                    { name: "months", value: "months" },
                                    { name: "weeks", value: "weeks" },
                                    { name: "days", value: "days" },
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
                            content: `${utils.woof()}! Set pings to ${bool ? "on" : "off"}! ${utils.emote("elated")}`,
                            ephemeral: true
                        })
                    }
                    break;
                case "scope":
                    const number = Math.abs(interaction.options.getInteger("number"))
                    const unit = interaction.options.getString("unit")
                    if (thisMember) {
                        await member.amend(thisMember.entityId, [
                            ["picks scope number", number],
                            ["picks scope unit", unit]
                        ])

                        interaction.reply({
                            content: `${utils.woof()}! You won't get pings for picks older than ${utils.numbers(number)} ${number === 1 ? unit.substring(0, unit.length-1) : unit}! ${utils.emote("elated")}`,
                            ephemeral: true
                        })
                    }
                    break;
                default: break;
            }
        }
        else {
            await getPicks()
        }
    })
