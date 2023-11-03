import { ChatInputCommandInteraction, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, TextChannel } from "discord.js";
import { request } from "undici";
import { ReadableCommand } from "../classes";
import { likeBeep, update } from "../net";
import { users } from '../config'
import { emote, time, tracer } from "../utils";

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
	), async (interaction: ChatInputCommandInteraction, corndog) => {
		const { DATA_URL } = process.env
		const { maize } = users
		const { socket } = corndog
		if (interaction.user.id !== maize) {
			await interaction.reply({
				content: `You're not Maize! ${emote("malcontent")}`,
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
			const finishedBeeps = ((await interaction.guild.channels.fetch("283697671741374465")) as TextChannel).messages
			switch (subcommandGroup) {
				case "update":
					switch (subcommand) {
						case "users":
							
							break;
						case "likes":
							await update("beep", async (beep) => {
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
							try {
								const label = "Beep"
								const property = "published"
								const index = "discordId"
								socket.emit("findBrokenNodes", {
									label,
									property,
									index
								})
								socket.once("foundBrokenNodes", async brokenNodes => {
									const indexes: string[] = brokenNodes.indexes
									const toFix = (await Promise.all(
										indexes.map(async index => {
											const message = await finishedBeeps.fetch(index).catch(() => null)
											if (!message) return {index, value: null}
											const value = `date("${time.convert(message.createdAt).format("YYYY-MM-DD")}")`
											console.log(`Beep ${index}["${property}"] => ${value}`)
											return {index, value}
										})
									)).filter(node => node)
									socket.emit("fixBrokenNodes", {
										label,
										property,
										index,
										toFix
									})
								})
								socket.once("fixedBrokenNodes", async fixedNodes => {
									interaction.editReply({ content: "Done!" })
								})
							}
							catch (error) {
								tracer.error(error)
							}
						default:
							break;
					}
				default:
					break;
			}
		}
	})
