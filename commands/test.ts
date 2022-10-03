import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { timeControl } from "../redis/entities";
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder()
        .setName("test")
        .setDescription("Test my features... -w-")
        .addSubcommand(
            subcommand => subcommand
                .setName("time")
                .setDescription("Test time controls")
        ),
    async (interaction: ChatInputCommandInteraction) => {
        const reply = await interaction.reply(
            {
                content: "Testing time controls now! Expect a message in a minute!",
                ephemeral: false
            })

        //@ts-ignore
        timeControl.generate({
            channel: interaction.channelId,
            message: reply.id,
            name: "test",
            cooldown: utils.time.goForth(10, "seconds").toDate()
        })

        const checks = setInterval(() => {
            timeControl.check("test", async () => {
                interaction.followUp({
                    content: "Time controls seem to be normal!",
                    ephemeral: true
                })
                clearInterval(checks)
            })
        }, 1000)

    })