import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType } from 'discord.js';
import { roles } from "../config";
import { timeControl } from "../redis/entities";
import utils from "../utils";
import { userMention } from 'discord.js';

export default new ReadableCommand(new SlashCommandBuilder().setName("yoink").setDescription("Yoinks! >:3c"), async (interaction: ChatInputCommandInteraction) => {
    const check = await timeControl.check("yoink", undefined, true)

    if (check) {
        let replyContent: string
        const member = (await interaction.guild.members.fetch()).get(interaction.user.id);
        const role = roles["some role idk"]

        interaction.guild.members.fetch()
        .then(members => members.each(member => {
            if (member.roles.cache.has(role)) member.roles.remove(role)
        }))
        .then(() => member.roles.add(role)).catch(() => replyContent = "You're unyoinkable...");
        
        replyContent ??= `${userMention(member.id)} yoinked it!`

        const reply = await interaction.reply({
            content: replyContent,
            ephemeral: false
        })

        //@ts-ignore
        await timeControl.generate({
            channel: interaction.channel.id,
            message: reply.id,
            name: "yoink",
            cooldown: utils.time.goForth(1, "day").toDate()
        })

        const interval = setInterval(async () => await timeControl.check("yoink", async () => {
            clearInterval(interval)
            member.roles.remove(role)
        }, false), 1000)
    }
    else {
        interaction.reply("Someone has already been yoinked! QwQ")
    }
})