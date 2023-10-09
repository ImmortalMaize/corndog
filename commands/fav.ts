import { ReadableCommand } from "../classes";
import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction, Attachment } from 'discord.js';
import { fav } from "../redis/entities";
import { EmbedBuilder } from 'discord.js';
import { woof, emote } from "../utils";

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
            option => option
            .setName("name")
            .setDescription("What's the name?")
            .setRequired(true)
        )
    )
    .addSubcommand(
        subcommand => subcommand
        .setName("attach")
        .setDescription("Set an attachment to a bookmark!")
        .addAttachmentOption(
            option => option
            .setName("sauce")
            .setDescription("What's the sauce?")
            .setRequired(true)
        )
        .addStringOption(
            option => option
            .setName("name")
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
    )
    .addSubcommand(
        subcommand => subcommand
        .setName("clear")
        .setDescription("Get a bookmark!")
        .addStringOption(
            option => option
            .setName("name")
            .setDescription("What's the name?")
            .setRequired(true)
        )
    )
    .addSubcommand(
        subcommand => subcommand
        .setName("all")
        .setDescription("Gets all the bookmarks!")
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
                content: woof() + "! I saved " + sauce + " as " + name + "! " + emote("elated"),
                ephemeral: true
            })
            return
        }
        if (interaction.options.getSubcommand() === "attach") {
            const sauce = interaction.options.getAttachment("sauce")
            const name = interaction.options.getString("name")

            //@ts-ignore
            fav.generate({
                user: interaction.user.id,
                sauce: sauce.url,
                name: name
            })

            await interaction.reply({
                content: woof() + "! I saved your " + sauce.contentType + " attachment as " + name + "! " + emote("elated"),
                ephemeral: true
            })
        }
        if (interaction.options.getSubcommand() === "get") {
            const name = interaction.options.getString("name")
            const isPublic = interaction.options.getBoolean("public") ?? false

            //@ts-ignore
            const sauce = (await fav.search(interaction.user.id, "name", name)).toJSON().sauce
            console.log(sauce)

            sauce
            ? await interaction.reply({
                content: sauce,
                ephemeral: !isPublic
            })
            : await interaction.reply({
                content: "https://tenor.com/view/confused-john-travolta-what-gif-5114829",
                ephemeral: true
            })
            return
        }
        if (interaction.options.getSubcommand() === "clear") {
            const name = interaction.options.getString("name")

            await fav.waste(interaction.user.id, name)
            await interaction.reply({
                content: `${woof()}! I cleared the bookmark named ${name}!`,
                ephemeral: true
            })
        }
        if (interaction.options.getSubcommand() === "all") {
            const member = (await interaction.guild.members.fetch()).get(interaction.user.id)

            const results = (await fav.all(interaction.user.id, 0))
            .map(bookmark => {
                const json = bookmark.toJSON()
                return {name: json.name, value: json.sauce}
            })

            const embed = new EmbedBuilder()
            .setTitle(member.nickname ?? member.user.username + "'s Bookmarks")
            .setThumbnail(member.avatarURL() ?? member.user.avatarURL())
            .addFields(results)

            interaction.reply({
                content: `${woof()}! Here are your bookmarks!`,
                embeds: [embed],
                ephemeral: true
            })
        }
    }
)