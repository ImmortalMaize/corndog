import { ReadableCommand } from "../classes";
import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction } from 'discord.js';
import { fav } from "../redis/entities";

export default new ReadableCommand(
    new SlashCommandBuilder()
    .setName("fav")
    .setDescription("Manage bookmarks!")
    .addSubcommand(
        subcommand => subcommand
        .setName("set")
        .setDescription("Set a bookmark!")
        .addStringOption(
            option => option
            .setName("sauce")
            .setDescription("What's the sauce?")
            .setRequired(true)
        )
        .addStringOption(
            option => option.setName("name")
            .setDescription("What's the name?")
            .setRequired(true)
        )
    )
    .addSubcommand(
        subcommand => subcommand
        .setName("get")
        .setDescription("Get a bookmark!")
        .addStringOption(
            option => option
            .setName("name")
            .setDescription("What's the name?")
            .setRequired(true)
        )
        .addBooleanOption(
            option => option
            .setName("public")
            .setDescription("Do you want this to be public?")
        )
    ),
    async (interaction: ChatInputCommandInteraction) => {

        if (interaction.options.getSubcommand() === "set") {
            const sauce = interaction.options.getString("sauce")
            const name = interaction.options.getString("name")

            //@ts-ignore
            fav.generate({
                user: interaction.user.id,
                sauce: sauce,
                name: name
            })

            await interaction.reply({
                content: "Okay! I saved " + sauce + " as " + name + "! ^_^",
                ephemeral: true
            })
        }
        if (interaction.options.getSubcommand() === "get") {
            const name = interaction.options.getString("name")
            const isPublic = interaction.options.getBoolean("public") ?? false

            //@ts-ignore
            const sauce = (await fav.search(interaction.user.id, "name", name))?.toJSON().sauce
            console.log(sauce)

            await interaction.reply({
                content: sauce,
                ephemeral: !isPublic
            })
        }
    }
)