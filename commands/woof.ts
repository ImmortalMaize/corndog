import { SlashCommandBuilder, Message } from "discord.js";
import utils from "../utils";

export default {
    data: new SlashCommandBuilder().setName('meow').setDescription('Meows back! :D'),
    async execute(interaction: Message): Promise<void> {
        await interaction.reply(`${utils.meow()}! ${utils.emote('cat')}`)
    }
}