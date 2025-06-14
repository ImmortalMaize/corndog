import { ReadableCommand } from "../../classes";
import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, GuildMember, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { channels } from "../../config";
import { TextChannel } from 'discord.js';
import { getChannel, hasUrl } from "../../utils"
import { ManipulateType } from "dayjs";
import setPicksSettings from "./setPicksSettings";
import getPicksTemporally from "./getPicksTemporally";
import picksLeaderboard from "../../templates/embeds/picks.leaderboard";
import { getMessage } from "../../utils/getMessage";

function paginate(array, pageSize, pageNumber) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

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
                                .setMinValue(0)
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
        const { options, member } = interaction
        interaction.deferReply({ ephemeral: true })
        if (options.getSubcommandGroup() === "set") {
            const pings = options.getBoolean("bool", true)
            const unit = options.getString("unit", true) as ManipulateType
            const number = options.getNumber("number", true)

            if (pings) await setPicksSettings(member as GuildMember, { pings })
            if (unit && number) await setPicksSettings(member as GuildMember, { scope: [unit, number] })

            const settingChanged = pings ? "pings" : "scope"
            await interaction.editReply({
                content: `Woof! Done setting ${settingChanged}!`
            })
        }

        const subcommand = options.getSubcommand()
        const unit = subcommand.substring(0, subcommand.length - 2) as ManipulateType;
        const picks = await getPicksTemporally(unit)
        for (const pick of picks) {
            const channel = await getChannel(interaction.guild.channels, channels["finished-beeps"]) as TextChannel
            const message = await getMessage(channel.messages, pick.discordId)
            const shortenedLink = message?.cleanContent.match(hasUrl).filter(url => url.match(/tinyurl|pastelink|pastebin|catbox/g))[0]
            pick.sauce = shortenedLink || message?.cleanContent.match(hasUrl)?.[0]
            pick.message = message?.url
            pick.avatar = message?.author.avatarURL()
            pick.username = message?.author.username

            if (!message) {
                console.warn(`No message found for pick with ID ${pick.discordId}.`)
                continue
            }
        }

        const pageSize = 2
        const paginatedPicks = Array(Math.min(5, Math.ceil(picks.length/2))).fill(null).map((_, i) => {
            const page = paginate(picks, pageSize, i + 1)
            return page
        })
        console.log(paginatedPicks[0])
        const embeds = picksLeaderboard(paginatedPicks[0])
        

        const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary);
        
        const paginationRow = new ActionRowBuilder().addComponents(previousButton, nextButton)
        await interaction.editReply({
            content: `Here are the Top 10 picks for this ${unit}`,
            ephemeral: true,
            // @ts-ignore
            components: [paginationRow],
            embeds
        })

        const filter = i => i.customId === 'next' || i.customId === 'previous';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000});

        let currentPage = 0;
        collector.on('collect', async (i) => {
            console.log(i.customId)
            await i.deferUpdate();
            if (i.customId === 'next') {
                currentPage++;
                if (currentPage === paginatedPicks.length - 1) {
                    nextButton.setDisabled(true);
                }
                previousButton.setDisabled(false);
            } else if (i.customId === 'previous') {
                currentPage--;
                if (currentPage <= 0) {
                    currentPage = 0;
                    previousButton.setDisabled(true);
                }
                nextButton.setDisabled(false);
            }
            console.log("Current page: " + currentPage)
            await i.editReply({
                content: `Here are the picks for this ${unit}`,
                embeds: picksLeaderboard(paginatedPicks[currentPage]),
                //@ts-ignore
                components: [paginationRow]
            });
        });
    })