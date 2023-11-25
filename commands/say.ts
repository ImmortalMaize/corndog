import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ReadableCommand } from "../classes";
import { users } from "../config";
import { emote, woof } from "../utils";

export default new ReadableCommand(new SlashCommandBuilder().setName("say").setDescription("Make me say something!").addStringOption(option => option.setName("something").setDescription("What should I say?")), async (interaction: ChatInputCommandInteraction) => {
	const { channel, options } = interaction
	const something = options.getString("something")

	if (interaction.member.user.id !== users.maize) {
		interaction.reply({
			content: `You're not the boss of me RGHRGHRGHRGH! ${emote("malcontent")}`,
			ephemeral: true
		})
		return
	}

	await channel.sendTyping().then(() => channel.send(`${woof()}! ${something} ${emote("furry")}`))
})