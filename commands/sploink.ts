import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType, InteractionResponse, Guild, GuildMember, GuildMemberRoleManager } from 'discord.js';
import { roles } from "../config";
import { timeControl } from "../redis/entities";
import { woof, emote, time } from "../utils";
import { userMention } from 'discord.js';
import { users } from '../config'

export default new ReadableCommand(new SlashCommandBuilder().setName("sploink").setDescription("Sploinks! O _o").addUserOption(option => option.setName("target").setDescription("Target to sploink...").setRequired(true)), async (interaction: ChatInputCommandInteraction) => {
    const check = await timeControl.check("sploink", undefined, true)
    const target = interaction.options.getUser("target")
    const member = interaction.member

    if (check) {
        if (!target) {
            interaction.reply({
                content: "You can't sploink someone that doesn't exist.",
                ephemeral: true
            })
            return
        }
        const role = roles["..."]

        //@ts-ignore
        const sploinked = member.roles.cache.has(role)
        const isMaize = member.user.id === users.maize
        console.log(sploinked, isMaize)

        if (!isMaize && !sploinked) {
            await interaction.reply({
                content: "In this world, it's be sploinked then sploink.",
                ephemeral: true
            })
            return
        }
        
        
        let reply: InteractionResponse

        interaction.guild.members.fetch()
        .then(
            members => members.each(mem => {
                if (mem.roles.cache.has(role)) mem.roles.remove(role)
            })
        )
        .catch(
            async () => {
                interaction.reply("It's unsploinkable...")
            }
        )
        .then(
            () => {
                target instanceof GuildMember ? target.roles.add(role) : interaction.guild.members.fetch(target.id).then(user => user.roles.add(role))
            }
        )
        .catch(
                (caught) => {console.log(caught);interaction.reply("You can't sploink them! >:(")}
            )
        .then(
            async () => {
                reply = await interaction.reply({
                content: `${woof()}! ${userMention(target.id)} has been sploinked! O _o`,
                ephemeral: false
            }
        )})
        .then(
            
            async () => {
                //@ts-ignore
                if (reply) await timeControl.generate({
                channel: interaction.channel.id,
                message: reply.id ?? "",
                name: "sploink",
                cooldown: time.goForth(1, "day").toDate()
            })
        }
        )
        
        const interval = setInterval(async () => await timeControl.check("yoink", async () => {
            clearInterval(interval)
        }, false), 1000)
    }
    else {
        interaction.reply(`${woof()}! Someone has already been sploinked...! ${emote("malcontent")}`)
    }
})