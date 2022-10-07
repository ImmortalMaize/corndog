import { ReadableCommand } from "../classes";
import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { timeControl } from "../redis/entities";
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder()
        .setName("test")
        .setDescription("Test my features~ -w-")
        .addSubcommand(
            subcommand => subcommand
                .setName("time")
                .setDescription("Test time controls")
        )
        .addSubcommand(
            subcommand => subcommand
                .setName("fix-users")
                .setDescription("Test time controls")
        ),
    async (interaction: ChatInputCommandInteraction) => {
        if (interaction.options.getSubcommand() === "time") {
            await interaction.reply(
                {
                    content: "Testing time controls now! Expect a message in a minute!",
                    ephemeral: false
                })

            //@ts-ignore
            timeControl.generate({
                channel: interaction.channelId,
                message: (await interaction.fetchReply()).id,
                name: "test",
                cooldown: utils.time.goForth(1, "minute").toDate()
            })

            const checks = setInterval(() => {
                timeControl.check("test", async () => {
                    interaction.followUp({
                        content: "Time controls seem to be normal!",
                        ephemeral: false
                    })
                    clearInterval(checks)
                })
            }, 1000)
        }
        if (interaction.options.getSubcommand() === "fix-users") {
            const members = await interaction.guild.members.fetch()
            const filteredMembers = members.filter(member => member.roles.cache.has("373936282893811723") && !member.roles.cache.has("235144257147502592"))
            filteredMembers.each(member => member.roles.add("235144257147502592").catch(() => console.log("Couldn't add role to" + member.nickname ?? member.user.username)))
        }
    })