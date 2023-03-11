import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder()
    .setName("be")
    .setDescription("Tell me how to feel... uwu")
    .addStringOption(
        option => option
        .setName("emotion")
        .setDescription("How should I feel?")
        .setRequired(true)
        .addChoices(
            {name: "elated", value: "elated"},
            {name: "content", value: "content"},
            {name: "furry", value: "furry"},
            {name: "malcontent", value: "malcontent"}
        )
    ),
    async (interaction: ChatInputCommandInteraction) => {
        const emotion = interaction.options.getString("emotion") as "elated" | "content" | "furry" | "malcontent"
        interaction.reply(utils.emote(emotion))
    }
)