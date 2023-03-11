import { SlashCommandBuilder, Message } from "discord.js";
import utils from "../utils";

export default {
    data: new SlashCommandBuilder().setName('woof').setDescription('Woofs back! :D'),
    async execute(interaction: Message): Promise<void> {
        await interaction.reply(`Woof! ${utils.emote('furry')}`)
    }
}