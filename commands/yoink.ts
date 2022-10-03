import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType } from 'discord.js';
import { misc } from "../config";
import { timeControl } from "../redis/entities";
import utils from "../utils";
import { userMention } from 'discord.js';

export default new ReadableCommand(new SlashCommandBuilder().setName("yoink").setDescription("Yoinks a member! >:3c").addUserOption(option => option.setName("member").setDescription("Member to be yoinked!").setRequired(true)), async (interaction: ChatInputCommandInteraction) => {
    const check = await timeControl.check("yoink")

    if (check) {
        const user = interaction.options.getUser("member")
        const member = (await interaction.guild.members.fetch()).get(user.id)
        await member.roles.add(misc['some role idk'])
        
        const reply = await interaction.reply({
            content: `${userMention(member.id)} got yoinked!`,
            ephemeral: false
        })

        //@ts-ignore
        await timeControl.generate({
            channel: interaction.channel.id,
            message: reply.id,
            name: "yoink",
            cooldown: utils.time.goForth(1, "week").toDate()
        })

        const interval = setInterval(async () => await timeControl.check("yoink", async () => {
            clearInterval(interval)
            member.roles.remove(misc['some role idk'])
        }), 1000)
    }
})