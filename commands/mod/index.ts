import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, userMention } from "discord.js";
import { ReadableCommand } from "../../classes";
import { getMember } from '../../utils/getMember';
import { getChannel, tracer } from "../../utils";
import { channels, roles as roleIds } from "../../config";
import notif from "./notif";

export default new ReadableCommand(new SlashCommandBuilder().setName("mod").setDescription("Moderation actions.").setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(subcommand => subcommand.setName("timeout").setDescription("Times out a member. Logs the action in #audit.")
        .addUserOption(option => option.setName("member").setDescription("Member to time out.").setRequired(true))
        .addIntegerOption(option => option.setName("length").setDescription("How long to time out the member").setRequired(true).setMinValue(0))
        .addStringOption(option => option.setName("reason").setDescription("Reason for timing the member out.").setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName("kick").setDescription("Kicks a member. Logs the action in #audit.")
        .addUserOption(option => option.setName("member").setDescription("Member to kick.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Reason for kicking the member.").setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName("ban").setDescription("Bans out a member. Logs the action in #audit.")
        .addUserOption(option => option.setName("member").setDescription("Member to ban.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Reason for banning the member.").setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName("offense").setDescription("Grants an offense to a member. Logs the action in #audit.")
        .addUserOption(option => option.setName("member").setDescription("Member to grant an offense to.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Reason for granting an offense to the member.").setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName("warn").setDescription("Warns a member. Logs the action in #audit.")
        .addUserOption(option => option.setName("member").setDescription("Member to grant an offense to.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Reason for granting an offense to the member.").setRequired(true))
    )
    , async (interaction: ChatInputCommandInteraction) => {
        const { options, guild } = interaction
        const moderator = interaction.member
        let action = options.getSubcommand()

        const reason = options.getString("reason")
        const length = options.getInteger("length")

        const member = await getMember(guild.members, options.getUser("member").id)
        if (!member) return;

        const reportsChannel = (await getChannel(guild.channels, channels["audit"])) as TextChannel

        const preterite = action === "kick" ? "kicked" :
            action === "ban" ? "banned" :
                action === "timeout" ? "timed out" :
                    action === "corn" ? "corned" :
                        action === "offense" ? "granted an offense to" :
                            "moderated"
        const summary = `
${moderator.user.username} ${preterite} ${member.user.username}.\n\n**Length:** ${length ? length + " min" : "N/A"}\n**Reason:** ${reason}
`
        const resolveAction = async (promise: Promise<any>) => promise.catch(async (err) => {
            tracer.error(err)
            await interaction.reply({
                ephemeral: true,
                content: "Didn't work. Sorry!"
            })
        }).then(async () => await reportsChannel.send(summary)).then(async () => await interaction.reply({
            ephemeral: true,
            content: `Okay, I ${preterite} ${userMention(member.user.id)}!`
        }))
        if (action === "warn") await resolveAction((async () => {})())
        if (action === "timeout") await resolveAction(member.timeout(length * 60_000, reason))
        if (action === "ban") await resolveAction(member.ban({ reason }))
        if (action === "kick") await resolveAction(member.kick(reason))
        if (action === "offense") {
            const { roles } = member
            if (roles.cache.has(roleIds["offense3"])) return;

            const newOffense: string = roles.cache.has(roleIds["offense2"]) ? roleIds["offense3"] :
            roles.cache.has(roleIds["offense1"]) ? roleIds["offense2"] : roleIds["offense1"]
            await resolveAction(member.roles.add(newOffense))
        }

        if (action === "warn") action = "warning"
        await notif(guild.channels, member.user, {name: action, description: reason})
    })