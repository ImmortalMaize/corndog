import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ReadableCommand } from "../classes";
import { member, timeControl } from "../redis/entities";
import utils from '../utils';
import { spots } from './../config'

const spotsMap = new Map<number, string>(spots as Array<[number, string]>)
export default new ReadableCommand(
    new SlashCommandBuilder().setName('dig').setDescription('Dig a hole').addIntegerOption(option => option.setName('spot').setDescription('The spot you want to dig').setRequired(true)),
    async (interaction: ChatInputCommandInteraction) => {
        const spot = Math.abs(interaction.options.getInteger('spot'))
        const user = member.get("id", interaction.user.id)
        const ready = await timeControl.check("dig_" + interaction.user.id)
        if (!ready) {
            await interaction.reply({ content: `You're too tired to dig!`, ephemeral: true })
            return
        }
        if (spot > 1000 || spot < 1) {
            await interaction.reply({ content: `You can't dig that spot!`, ephemeral: true })
            return
        }
        if (spotsMap.has(spot)) {
            const image = new AttachmentBuilder("assets/" + spotsMap.get(spot) + ".png")
            await interaction.reply({ content: `
You spend a couple of minutes digging as far down as you can, eventually reaching something you can't dig through with your hands. This is as far down as you can go. 

Lying there, at the bottom of the hole you've dug, is a small sliver of paper, which seems to be a damaged image…`,
            files: [image], ephemeral: true })
            return
        }
        const reply = await interaction.reply({ content: `You dug a hole at spot ${spot}!`, ephemeral: true })

        //@ts-ignore
        timeControl.generate({
            channel: interaction.channelId,
            message: reply.id,
            cooldown: utils.time.goForth(3, "hours").toDate(),
            name: "dig_" + interaction.user.id,
        })
    }
)