import { ChatInputCommandInteraction, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, TextChannel } from "discord.js";
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
			.addSubcommand(
				new SlashCommandSubcommandBuilder()
					.setName("dates")
					.setDescription("Make sure publication dates are up to date!")
			)
	), async (interaction: ChatInputCommandInteraction) => {
		const { MAIZE, DATA_URL } = process.env
		if (interaction.user.id !== MAIZE) {
			await interaction.reply({
				content: `You're not Maize! ${utils.emote("malcontent")}`,
				ephemeral: true
			})
			return
		}
		else {
			const subcommandGroup = interaction.options.getSubcommandGroup()
			const subcommand = interaction.options.getSubcommand()
			const endpoint = DATA_URL + 'content/'
			const guild = interaction.guild
			const contentType = { 'Content-Type': 'application/json' };
			await interaction.deferReply({
				ephemeral: true
			})

			switch (subcommandGroup) {
				case "update":
					switch (subcommand) {
						case "users":
							await update("user", async (user) => {
								const { username } = await interaction.client.users.fetch(user.discordId)
								request(endpoint + 'user/primary/' + user.discordId, {
									method: 'PATCH',
									headers: contentType,
									body: JSON.stringify({
										username
									})
								})
							}).then(async () => await interaction.editReply({
								content: "Done!",

							}))
							break;
						case "likes":
							await update("beep", async (beep) => {
								const finishedBeeps = ((await interaction.guild.channels.fetch("283697671741374465")) as TextChannel).messages
								const message: Message = await finishedBeeps.fetch(beep.discordId).catch(() => null)
								if (message) {
									const likers = await message.reactions.cache.get("👌")?.users.fetch()
									if (likers) for (const liker of likers) {

										await likeBeep(message, liker[1], message.author).catch(() => {
											console.log("Liker " + liker[1].id + " failed to like beep " + message.id + ".")
										}).then(() => console.log("Liker " + liker[1].id + " liked beep " + message.id + "."))
									}

								} else {
									console.log("Beep " + beep.discordId + " missing!")
								}
							}).then(async () => interaction.editReply({ content: "Done!" }))
							break;
						case "dates":
							const finishedBeeps = ((await interaction.guild.channels.fetch("283697671741374465")) as TextChannel).messages
							await update("beep", async (beep) => {

								const found = await finishedBeeps.fetch(beep.discordId).catch(() => null)
								if (found) {
									const { createdAt } = found
									await request(endpoint + 'beep/primary/' + beep.discordId, {
										method: 'PATCH',
										headers: contentType,
										body: JSON.stringify({
											published: createdAt
										})
									})
									console.log(`${beep.discordId} done!`)
								}
								else console.log(`${beep.discordId} missing!`)

							}).then(async () => {
								await interaction.editReply({
									content: "Done!",
								})
							})
						default:
							break;
					}
				default:
					break;
			}
		}
	})
