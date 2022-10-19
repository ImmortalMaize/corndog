import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType, InteractionResponse, Guild, GuildMember } from 'discord.js';
import { roles } from "../config";
import { timeControl } from "../redis/entities";
import utils from "../utils";
import { userMention } from 'discord.js';

export default new ReadableCommand(new SlashCommandBuilder().setName("yoink").setDescription("Yoinks! >:3c"), async (interaction: ChatInputCommandInteraction) => {
    const check = await timeControl.check("yoink", undefined, true)

    if (check) {
        const member = interaction.member
        if (!member) {
            interaction.reply({
                content: "You don't exist",
                ephemeral: true
            })
            return
        }
        const role = roles["some role idk"]
        
        let reply: InteractionResponse
        member instanceof GuildMember
        
        interaction.guild.members.fetch()
        .then(
            members => members.each(mem => {
                if (mem.roles.cache.has(role)) mem.roles.remove(role)
            })
        )
        .catch(
            () => interaction.reply("It's unyoinkable...")
        )
        .then(
            () => {
                console.log(member)
                member instanceof GuildMember ? member.roles.add(role) : member.roles.push(role)
            }
        )
        .catch(
                (caught) => {console.log(caught);interaction.reply("You can't yoink it! >:(")}
            )
        .then(
            () => interaction.reply({
                content: `${userMention(member instanceof GuildMember ? member.id : member.user.id)} yoinked it!`,
                ephemeral: false
            }
        ))
        .then(
            //@ts-ignore
            () => timeControl.generate({
                channel: interaction.channel.id,
                message: reply.id,
                name: "yoink",
                cooldown: utils.time.goForth(1, "day").toDate()
            })
        )
        
        const interval = setInterval(async () => await timeControl.check("yoink", async () => {
            clearInterval(interval)
        }, false), 1000)
    }
    else {
        interaction.reply("Someone has already been yoinked! QwQ")
    }
})