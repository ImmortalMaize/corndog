import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType, InteractionResponse } from 'discord.js';
import { roles } from "../config";
import { timeControl } from "../redis/entities";
import utils from "../utils";
import { userMention } from 'discord.js';

export default new ReadableCommand(new SlashCommandBuilder().setName("yoink").setDescription("Yoinks! >:3c"), async (interaction: ChatInputCommandInteraction) => {
    const check = await timeControl.check("yoink", undefined, true)
    if (check) {
        const member = (await interaction.guild.members.fetch()).get(interaction.user.id);
        const role = roles["some role idk"]
        
        let reply: InteractionResponse

        interaction.guild.members.fetch()
        .then(
            members => members.each(member => {
                if (member.roles.cache.has(role)) member.roles.remove(role)
            })
        )
        .catch(
            () => interaction.reply("It's unyoinkable...")
        )
        .then(
            async () => {
                if (!interaction.reply) await member.roles.add(role)
            }
        )
        .catch(
                async () => await interaction.reply("You can't yoink it! >:(")
            )
        .then(
            async () => {
                if (!interaction.reply)
                await interaction.reply({
                content: `${userMention(member.id)} yoinked it!`,
                ephemeral: false
            }).then(
                //@ts-ignore
                () => timeControl.generate({
                    channel: interaction.channel.id,
                    message: reply.id,
                    name: "yoink",
                    cooldown: utils.time.goForth(1, "day").toDate()
                })
            )
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