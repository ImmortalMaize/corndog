import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from "discord.js";
import { ReadableCommand } from "../classes";
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder().setName('woof').setDescription('Uuugh... >_>'),
    async (interaction: ChatInputCommandInteraction) => {
        const no = ["No", "Non", "Haram", "T-that's haram..", "Nope", "حَرَام", "Hélas non", "Please no", "P-please", "I refuse..", "pls..", "I'm begging you.."]
        const randomNo = no[Math.floor(Math.random() * no.length)]
        const random = Math.floor(Math.random() * 100)
        console.log(random)
        const response = (random >= 80)||interaction.member.user.id === "143866772360134656" ? `${utils.woof()}! ${utils.emote('furry')}` : `${randomNo}. ${utils.emote('neutral')}`
        await interaction.reply(`${response}`)
    }
)