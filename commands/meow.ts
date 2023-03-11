import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from "discord.js";
import { ReadableCommand } from "../classes";
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder().setName('woof').setDescription('Woofs back! :D'),
    async (interaction: ChatInputCommandInteraction) => {
        await interaction.reply(`No. ${utils.emote('malcontent')}`)
    }
)