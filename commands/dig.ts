import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ReadableCommand } from "../classes";
import { timeControl } from "../redis/entities";
import utils from '../utils';

export default new ReadableCommand(
    new SlashCommandBuilder().setName('dig').setDescription('Dig a hole').addIntegerOption(option => option.setName('spot').setDescription('The spot you want to dig').setRequired(true)),
    async (interaction: ChatInputCommandInteraction) => {
        const spot = Math.abs(interaction.options.getInteger('spot'))
        const ready = await timeControl.check("dig_" + interaction.user.id)
        if (!ready) {
            await interaction.reply({ content: `You're too tired to dig!`, ephemeral: true })
            return
        }
        if (spot > 1000 || spot < 1) {
            await interaction.reply({ content: `You can't dig that spot!`, ephemeral: true })
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