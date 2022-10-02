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
        interaction.reply(
            {
                content: "Testing time controls now! Expect a message in a minute!",
                ephemeral: true
            })

        //@ts-ignore
        timeControl.generate({
            name: "test",
            cooldown: utils.time.goForth(1, "minute").toDate()
        })

        const checks = setInterval(() => {
            timeControl.check(new Map([
                ["test", async () => {
                    interaction.reply({
                        content: "Time controls seem to be normal!",
                        ephemeral: true
                })
                clearInterval(checks)
                }]
            ])) 
        }, 1000)

    })