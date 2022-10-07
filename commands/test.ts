import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, ThreadChannel, GuildMember } from 'discord.js';
import { timeControl } from "../redis/entities";
import { roles } from "../config"
import utils from "../utils";

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
                })
            }, 1000)
        }
        if (interaction.options.getSubcommand() === "fix-users") {
            const members = await interaction.guild.members.fetch()
            const filteredMembers = members.filter(member => member.roles.cache.has("373936282893811723") && !member.roles.cache.has("235144257147502592"))
            filteredMembers.each(member => member.roles.add("235144257147502592").catch(() => console.log("Couldn't add role to" + member.nickname ?? member.user.username)))
        }
        if (interaction.options.getSubcommand() === "fix-ascend") {
            const members = await interaction.guild.members.fetch()
            const mb = members.filter(member => (member.roles.cache.has(roles.mb2)||member.roles.cache.has(roles.mb3)||member.roles.cache.has(roles.mb4)) && !member.roles.cache.has(roles.mb1)) 
            console.log("Fixing MB!")
            console.log(mb)     
            mb.each((member: GuildMember) => member.roles.add(roles.mb1).catch(() => console.log("Couldn't add role to" + member.nickname ?? member.user.username)))

            const bb = members.filter(member => (member.roles.cache.has(roles.bb2)||member.roles.cache.has(roles.bb3)||member.roles.cache.has(roles.bb4)) && !member.roles.cache.has(roles.bb1))
            console.log("Fixing BB!")
            console.log(bb)
            bb.each((member: GuildMember) => member.roles.add(roles.mb1).catch(() => console.log("Couldn't add role to" + member.nickname ?? member.user.username)))
        }
    })