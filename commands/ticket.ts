import { ChannelType, ChatInputCommandInteraction, GuildMember, roleMention, SlashCommandBuilder, TextChannel, User, userMention} from "discord.js";
import { ReadableCommand } from "../classes";
import { channels, roles } from "../config";
import { emote, getChannel, reportEmbed, tracer } from "../utils";

export default new ReadableCommand(new SlashCommandBuilder().setName("ticket").setDescription("Submit a ticket!")
.addStringOption(option => option.setName("description").setDescription("Describe your concern!").setRequired(true))
.addStringOption(option => option.setName("category").setDescription("Who is this ticket for?").setChoices(
	{ name: "Moderation", value: "moderator"},
	{ name: "Server Support", value: "server support" },
	{ name: "Community Support", value: "community support"}
).setRequired(true)), async (interaction: ChatInputCommandInteraction) => {
	const { guild, member, options } = interaction
	const { tickets, reports } = channels

	//creates thread in #tickets
	const ticketsChannel = await getChannel(guild.channels, tickets) as TextChannel
	const description = options.getString("description")
	const thread = await ticketsChannel.threads.create({
		type: ChannelType.PrivateThread,
		name: description,
	}).catch(error => tracer.error(error))
	if (!thread) return;
	await thread.members.add(member.user.id).catch(error => tracer.error(error))

	//makes report in #reports
	const category = options.getString("category") as "moderator"|"server support"|"community support"
	const { url } = thread
	const reportsChannel = await getChannel(guild.channels, reports).catch(error => tracer.error(error)) as TextChannel
	reportsChannel.send({
		content: `${roleMention(roles[category])}, ${userMention(member.user.id)} submitted a new ticket! ${url}`,
		embeds: [reportEmbed(member.user as User, description)]
	}).catch(error => tracer.error(error))

	await interaction.reply({
		content: `Ticket created! ${emote("elated")}`,
		ephemeral: true
	})
})