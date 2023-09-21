import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandInteraction } from "discord.js";
import { ReadableCommand } from "../classes";
import { updateOne } from "../net";

export default new ReadableCommand(
	new ContextMenuCommandBuilder()
	.setName("Fix Author")
	.setType(ApplicationCommandType.Message), async (interaction: ContextMenuCommandInteraction) => {
		const message = (await interaction.channel.messages.fetch()).get(interaction.targetId)

		const { username, id } = message.author

		await updateOne("user", id, {
			username
		})
	})