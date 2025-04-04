import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType, InteractionResponse, Guild, GuildMember } from 'discord.js';
import { roles } from "../config";
import { TimeControl } from "../redis/entities";
import { woof, emote, time } from "../utils";
import { userMention } from 'discord.js';

export default new ReadableCommand(new SlashCommandBuilder().setName("yoink").setDescription("Yoinks! >:3c"), async (interaction: ChatInputCommandInteraction) => {
    const check = await TimeControl.check("yoink", undefined, true)

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

        interaction.guild.members.fetch()
            .then(members => members.each(mem => { if (mem.roles.cache.has(role)) mem.roles.remove(role) }))
            .catch(async () => { interaction.reply("It's unyoinkable...") })
            .then(() => { member instanceof GuildMember ? member.roles.add(role) : member.roles.push(role) })
            .catch((caught) => { console.log(caught); interaction.reply("You can't yoink it! >:(") })
            .then(async () => {
                reply = await interaction.reply({
                    content: `${woof()}! ${userMention(member.user.id)} yoinked it! ${emote("elated")}`, ephemeral: false
                }
                )
            })
            .then(async () => {
                //@ts-ignore
                if (reply) await TimeControl.generate({
                    channel: interaction.channel.id,
                    message: reply.id ?? "",
                    name: "yoink",
                    
                }, time.duration({ days: 1 })/1000)
            }
            )
    }
    else {
        interaction.reply(`${woof()}! Someone already yoinked it! ${emote("malcontent")}`)
    }
})