import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from "discord.js";
import { ReadableCommand } from "../classes";
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder().setName('meow').setDescription('Meows back! :3'),
    async (interaction: ChatInputCommandInteraction) => {
        const response = Math.floor(Math.random() * 100) < 95 ? `Meow! ${utils.emote('cat')}` :`Non. ${utils.emote('neutral')}`
        await interaction.reply(`${response}`)
    }
)