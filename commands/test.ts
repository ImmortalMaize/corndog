import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, ThreadChannel, GuildMember, Message } from 'discord.js';
import { finishedBeep, TimeControl } from "../redis/entities";
import { channels, config, roles } from "../config"
import { time, emojis, getReactions, impartial } from "../utils";
import { TextChannel } from 'discord.js';
import { getMessage } from "../utils/getMessage";
import net from "../net";
import { DynamicPool } from "node-worker-threads-pool";

// async function crawl (channel: TextChannel) {
//     const seen = new Set()
//     const messages = await channel.messages.fetch({ limit: 100 })
//     if (messages.size === 0) return
//     else {
//         const lowestId = messages.map(message => message.id).sort()[0]
//     }
// }

export default new ReadableCommand(
    new SlashCommandBuilder()
        .setName("test")
        .setDescription("Test my features~ -w-")
        .addSubcommand(
            subcommand => subcommand
                .setName("time")
                .setDescription("Test time controls.")
        )
        .addSubcommand(
            subcommand => subcommand
                .setName("fix-users")
                .setDescription("Makes sure everyone has user roles.")
        )
        .addSubcommand(
            subcommand => subcommand
                .setName("fix-ascend")
                .setDescription("Makes sure beepers have all roles of their ascension.")
        )
        .addSubcommand(
            subcommand => subcommand
                .setName("bb-scraper")
                .setDescription("Scrapes for Beep Bishop submissions.")
        )
        .addSubcommand(
            subcommand => subcommand
                .setName("fix-records")
                .setDescription("Updates Redis records with correct values!")
        )
    ,
    async (interaction: ChatInputCommandInteraction) => {
        if (interaction.options.getSubcommand() === "time") {
            await interaction.reply(
                {
                    content: "Testing time controls now! Expect a message in a minute!",
                    ephemeral: false
                })

            //@ts-ignore
            TimeControl.generate({
                channel: interaction.channelId,
                message: (await interaction.fetchReply()).id,
                name: "test",
            })

            const checks = setInterval(() => {
                TimeControl.check("test", async () => {
                    interaction.followUp({
                        content: "Time controls seem to be normal!",
                        ephemeral: false
                    })
                    clearInterval(checks)
                }, false)
            }, 1000)
        }

        if (interaction.options.getSubcommand() === "fix-users") {
            const members = await interaction.guild.members.fetch()
            const filteredMembers = members.filter(member => member.roles.cache.has("373936282893811723") && !member.roles.cache.has("235144257147502592"))
            filteredMembers.each(member => member.roles.add("235144257147502592").catch(() => console.log("Couldn't add role to" + member.nickname)))
        }

        if (interaction.options.getSubcommand() === "fix-ascend") {
            const members = await interaction.guild.members.fetch()
            const mb = members.filter(member => (member.roles.cache.has(roles.mbl2) || member.roles.cache.has(roles.mbl3) || member.roles.cache.has(roles.mbl4)) || member.roles.cache.has(roles.mbl1))
            console.log("Fixing MB!")
            console.log(mb)
            mb.each((member: GuildMember) => {
                if (member.roles.cache.has(roles.mbl4)) {
                    member.roles.remove(roles.mbl3).catch(() => console.log("Couldn't remove role from" + member.nickname))
                    member.roles.remove(roles.mbl2).catch(() => console.log("Couldn't remove role from" + member.nickname))
                    member.roles.remove(roles.mbl1).catch(() => console.log("Couldn't remove role from" + member.nickname))
                }

                if (member.roles.cache.has(roles.mbl3)) {
                    member.roles.remove(roles.mbl2).catch(() => console.log("Couldn't remove role from" + member.nickname))
                    member.roles.remove(roles.mbl1).catch(() => console.log("Couldn't remove role from" + member.nickname))
                }

                if (member.roles.cache.has(roles.mbl2)) {
                    member.roles.remove(roles.mbl1).catch(() => console.log("Couldn't remove role from" + member.nickname))
                }
            })

            const bb = members.filter(member => (member.roles.cache.has(roles.bbl2) || member.roles.cache.has(roles.bbl3) || member.roles.cache.has(roles.bbl4)) || member.roles.cache.has(roles.bbl1))
            console.log("Fixing BB!")
            console.log(bb)
            bb.each((member: GuildMember) => {
                if (member.roles.cache.has(roles.bbl4)) {
                    member.roles.remove(roles.bbl3).catch(() => console.log("Couldn't remove role from" + member.nickname))
                    member.roles.remove(roles.bbl2).catch(() => console.log("Couldn't remove role from" + member.nickname))
                    member.roles.remove(roles.bbl1).catch(() => console.log("Couldn't remove role from" + member.nickname))
                }

                if (member.roles.cache.has(roles.bbl3)) {
                    member.roles.remove(roles.bbl2).catch(() => console.log("Couldn't remove role from" + member.nickname))
                    member.roles.remove(roles.bbl1).catch(() => console.log("Couldn't remove role from" + member.nickname))
                }

                if (member.roles.cache.has(roles.bbl2)) {
                    member.roles.remove(roles.bbl1).catch(() => console.log("Couldn't remove role from" + member.nickname))
                }
            })
        }

        if (interaction.options.getSubcommand() === "bb-scraper") {
            const finishedBeeps = (interaction.guild.channels.cache.get(channels["finished-beeps"]) ?? await interaction.guild.channels.fetch(channels["finished-beeps"])) as TextChannel
            let percentage = 0
            await interaction.reply({
                content: `Scraping for Beep Bishop submissions! This may take a while, please be patient! ${percentage}%`,
                ephemeral: true
            })
            const beeps = await finishedBeep.view()
            const submissions = beeps.filter(beep => beep.submission).sort((a, b) => time.convert(a.date).unix() - time.convert(b.date).unix())
            
            const entries = Array.from(submissions.entries())

            const dynamicPool = new DynamicPool(5)
            for (let i = 296; i < entries.length; i++) {
                const [index, beep] = entries[i]
                const message = await impartial(await getMessage(finishedBeeps.messages, beep.submission)).catch(() => null)
                console.log("Processing " + beep.entityId + "...")
                if (!message) continue;
                const likers = (await getReactions(message as Message, emojis.hand).users.fetch()).filter(user => {
                    if (user?.id) return user.id !== (message.author.id) && user.id !== config.clientId; else return false
                })
                await net.likeBeep(message, message.author, Array.from(likers.values())).catch(() => {})
                percentage = Math.round((index / submissions.length) * 100)
                console.log("Progress: " + percentage + "%" + index + "/" + submissions.length)
                await interaction.editReply({
                    content: `Scraping for Beep Bishop submissions! This may take a while, please be patient! ${percentage}% ${index}`
                })
            }
        }

        if (interaction.options.getSubcommand() === "fix-records") {
            console.log("Fixing the records! ^~^")
            const finishedBeeps = (interaction.guild.channels.cache.get(channels["finished-beeps"]) ?? await interaction.guild.channels.fetch(channels["finished-beeps"])) as TextChannel
            const beeps = await finishedBeep.view()
            beeps.filter(beep => !beep.submission || !beep.embed).forEach(async beep => {
                console.log("Found a bastard! " + beep.entityId)
                await finishedBeep.waste(beep.entityId)
                return
            })
            for (const [index, beep] of beeps.entries()) {
                const percentage = Math.round((index / beeps.length) * 100)
                if (!beep.count || !beep.date) {
                    console.log("(" + percentage + "%) Fixing " + beep.entityId + "...")
                    const submission = await finishedBeeps.messages.fetch(beep.submission).catch(() => null)
                    if (!submission) {
                        console.log("Aaaand " + beep.submission + "is gone...")
                        await finishedBeep.waste(beep.entityId)
                        continue
                    }
                    const count = (await submission.reactions.cache.get(emojis.hand)?.users.fetch())?.filter(user => user.id !== (submission.author.id) && user.id !== config.clientId).size ?? 0
                    const date = submission.createdAt
                    await finishedBeep.amend(beep.entityId, [
                        ["count", count],
                        ["date", date]
                    ])
                    if (index + 1 === beeps.length) console.log("Done! :D")
                }
            }
        }
    }
)

