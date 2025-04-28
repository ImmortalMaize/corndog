import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType, InteractionResponse, Guild, GuildMember, GuildMemberRoleManager } from 'discord.js';
import { roles, users } from "../config";
import { meow, woof, emote, time } from "../utils";
import { userMention } from 'discord.js';
import { TimeControl } from "../redis/entities";

export default new ReadableCommand(new SlashCommandBuilder().setName("setIcon").setDescription("Give or remove an icon if you have the correct role"), async (interaction: ChatInputCommandInteraction) => {
    const check = await TimeControl.check("sploink", undefined, true)
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
        console.log("Are they sploinked? " + sploinked, "Is the sploinker Maize? " +  isMaize)

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
                target instanceof GuildMember && !isMaize ? target.roles.add(role) : interaction.guild.members.fetch(target.id).then(user => user.roles.add(role))
            }
        )
        .catch(
                (caught) => {console.log(caught);interaction.reply("You can't sploink them! >:(")}
            )
        .then(
            async () => {
                reply = await interaction.reply({
                content: `${woof()}! ${userMention(target.id)} just got sploinked! O _o`,
                ephemeral: false
            }
        )})
        .then(
            async () => {
                //@ts-ignore
                if (reply) await TimeControl.generate({
                channel: interaction.channel.id,
                message: reply.id ?? "",
                name: "sploink",
            }, time.duration({ days: 1 })/1000)
        }
        )
    }
    else {
        interaction.reply(`${woof()}! Someone has already been sploinked...! ${emote("malcontent")}`)
    }
})