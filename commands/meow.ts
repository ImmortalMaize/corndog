import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from "discord.js";
import { ReadableCommand } from "../classes";
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder().setName('meow').setDescription('Meows back! :3'),
    async (interaction: ChatInputCommandInteraction) => {
        const random = Math.floor(Math.random() * 100)
        console.log(random)
        const response = (random > 95)||interaction.member.user.id === "143866772360134656" ? `Meow! ${utils.emote('cat')}` : `Non. ${utils.emote('neutral')}`
        await interaction.reply(`${response}`)
    }
)