import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, ThreadChannel, GuildMember } from 'discord.js';
import { finishedBeep, timeControl } from "../redis/entities";
import { channels, config, roles } from "../config"
import utils from "../utils";
import { TextChannel } from 'discord.js';

async function crawl (channel: TextChannel) {
    const seen = new Set()
    const messages = await channel.messages.fetch({ limit: 100 })
    if (messages.size === 0) return
    else {
        const lowestId = messages.map(message => message.id).sort()[0]
    }
}

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
            timeControl.generate({
                channel: interaction.channelId,
                message: (await interaction.fetchReply()).id,
                name: "test",
                cooldown: utils.time.goForth(1, "minute").toDate()
            })

            const checks = setInterval(() => {
                timeControl.check("test", async () => {
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
            filteredMembers.each(member => member.roles.add("235144257147502592").catch(() => console.log("Couldn't add role to" + member.nickname ?? member.user.username)))
        }

        if (interaction.options.getSubcommand() === "fix-ascend") {
            const members = await interaction.guild.members.fetch()
            const mb = members.filter(member => (member.roles.cache.has(roles.mbl2)||member.roles.cache.has(roles.mbl3)||member.roles.cache.has(roles.mbl4))||member.roles.cache.has(roles.mbl1)) 
            console.log("Fixing MB!")
            console.log(mb)     
            mb.each((member: GuildMember) => {
                if (member.roles.cache.has(roles.mbl4)) {
                    member.roles.remove(roles.mbl3).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                    member.roles.remove(roles.mbl2).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                    member.roles.remove(roles.mbl1).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                }

                if (member.roles.cache.has(roles.mbl3)) {
                    member.roles.remove(roles.mbl2).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                    member.roles.remove(roles.mbl1).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                }

                if (member.roles.cache.has(roles.mbl2)) {
                    member.roles.remove(roles.mbl1).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                }
            })

            const bb = members.filter(member => (member.roles.cache.has(roles.bbl2)||member.roles.cache.has(roles.bbl3)||member.roles.cache.has(roles.bbl4))||member.roles.cache.has(roles.bbl1))
            console.log("Fixing BB!")
            console.log(bb)
            bb.each((member: GuildMember) => {
                if (member.roles.cache.has(roles.bbl4)) {
                    member.roles.remove(roles.bbl3).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                    member.roles.remove(roles.bbl2).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                    member.roles.remove(roles.bbl1).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                }

                if (member.roles.cache.has(roles.bbl3)) {
                    member.roles.remove(roles.bbl2).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                    member.roles.remove(roles.bbl1).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                }

                if (member.roles.cache.has(roles.bbl2)) {
                    member.roles.remove(roles.bbl1).catch(() => console.log("Couldn't remove role from" + member.nickname ?? member.user.username))
                }
            })
        }

        if (interaction.options.getSubcommand() === "bb-scraper") {
            const finishedBeeps = (interaction.guild.channels.cache.get(channels["finished-beeps"]) ?? await interaction.guild.channels.fetch(channels["finished-beeps"])) as TextChannel
            const messages = await finishedBeeps.messages.fetch({ limit: 100 })
        }

        if (interaction.options.getSubcommand() === "fix-records") {
            console.log("Fixing the records! ^~^")
            const finishedBeeps = (interaction.guild.channels.cache.get(channels["finished-beeps"]) ?? await interaction.guild.channels.fetch(channels["finished-beeps"])) as TextChannel
            const beeps = await finishedBeep.view()
            for (const beep of beeps) {
                const submission = await finishedBeeps.messages.fetch(beep.submission)
                const count = (await submission.reactions.cache.get(utils.emojis.hand).users.fetch()).filter(user => user.id !== (submission.author.id) && user.id !== config.clientId).size
                const date = submission.createdAt
                await finishedBeep.amend(beep.entityId, [
                    ["count", count],
                    ["date", date]
                ])
            }
        }
    })