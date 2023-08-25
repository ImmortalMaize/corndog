import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, TextChannel } from "discord.js";
import { request } from "undici";
import { ReadableCommand } from "../classes";
import { likeBeep, update } from "../net";
import utils from "../utils";

export default new ReadableCommand(new SlashCommandBuilder()
	.setName("scurvy")
	.setDescription("Check on Scurvy!")
	.addSubcommandGroup(
		new SlashCommandSubcommandGroupBuilder()
			.setName("update")
			.setDescription("Make sure nodes are up to date!")
			.addSubcommand(
				new SlashCommandSubcommandBuilder()
					.setName("users")
					.setDescription("Make sure users are up to date!")
			)
			.addSubcommand(
				new SlashCommandSubcommandBuilder()
				.setName("likes")
				.setDescription("Make sure likes are up to date!")
			)
	), async (interaction: ChatInputCommandInteraction) => {
		const { MAIZE, DATA_URL } = process.env
		if (interaction.user.id !== MAIZE) return;

		const subcommandGroup = interaction.options.getSubcommandGroup()
		const subcommand = interaction.options.getSubcommand()
		const endpoint = DATA_URL + 'content/user'
		const guild = interaction.guild
		const contentType = { 'Content-Type': 'application/json' };
		switch (subcommandGroup) {
			case "update":
				switch (subcommand) {
					case "users":
						await update("user", async (user) => {
							const { username } = await interaction.client.users.fetch(user.discordId)
							request(endpoint + '/primary/' + user.discordId, {
								method: 'PATCH',
								headers: contentType,
								body: JSON.stringify({
									username
								})
							})
						})
						await interaction.reply({
							content: "Done!",
							ephemeral: true
						})
						break;
					case "likes":
						const reply = await interaction.reply({
							content: "Doing it!",
							ephemeral: true
						})
						const finishedBeeps = ((await interaction.guild.channels.fetch("283697671741374465")) as TextChannel).messages
						await update("beep", async (beep) => {
							const message = await finishedBeeps.fetch(beep.discordId)
							const likers = await message.reactions.cache.get("👌").users.fetch()
							for (const liker of likers) {
								await likeBeep(message, liker[1], message.author)
								reply.edit({
									content: "Doing " + liker[1].username + " and beep " + beep.discordId + "! " + utils.emote("elated"),
								})
							}
						})
						break;
					default:
						break;
				}
			default:
				break;
		}
	})
