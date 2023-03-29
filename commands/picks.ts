import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import { channels, config } from "../config";
import { TextChannel } from 'discord.js';
import utils from "../utils"
import { finishedBeep, member } from "../redis/entities";
import { EmbedBuilder } from 'discord.js';

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

            const embed = new EmbedBuilder().setAuthor({name: "#1 - Maize", iconURL: "https://cdn.discordapp.com/guilds/235138363131166728/users/143866772360134656/avatars/a_8080c2462fe831a7494d8d7146a2d41b.gif?size=4096"})
            .setDescription("penis lol").setFields({name: "Sauce", value: "hibu.com apache.org comcast.net businesswire.com theguardian.com", inline: false}, {name: "Score", value: "42", inline: true}, {name: "Date", value: "04-27-2002", inline: true})
            console.log(pickReactions.slice(0, 10))
            interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
        }
    })