import { SlashCommandBuilder, Message } from "discord.js";
import { woof, emote, tracer } from "../utils";

export default {
    data: new SlashCommandBuilder().setName('woof').setDescription('Woofs back! :D'),
    async execute(interaction: Message): Promise<void> {
        tracer.woof("Woof!")
        await interaction.reply(`${woof()}! ${emote('furry')}`)
    }
}