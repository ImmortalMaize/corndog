import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from "discord.js";
import { ReadableCommand } from "../classes";
import { meow, emote } from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder().setName('meow').setDescription('Uuugh... >_>'),
    async (interaction: ChatInputCommandInteraction) => {
        const no = ["No", "Non", "Haram", "T-that's haram..", "Nope", "حَرَام", "Hélas non", "Please no", "P-please", "I refuse..", "pls..", "I'm begging you.."]
        const randomNo = no[Math.floor(Math.random() * no.length)]
        const random = Math.floor(Math.random() * 100)
        console.log(random)
        const response = (random >= 80)||interaction.member.user.id === "143866772360134656" ? `${meow()}! ${emote('cat')}` : `${randomNo}. ${emote('neutral')}`
        await interaction.reply(`${response}`)
    }
)