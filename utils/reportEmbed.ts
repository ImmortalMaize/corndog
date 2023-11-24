import { ColorResolvable, EmbedBuilder, User} from "discord.js";
import { getPurple } from "./getPurple";

export const reportEmbed = (
	author: User,
	content: string
) => {
	console.log(author.avatar)
	const username = author.username

	return new EmbedBuilder()
	.setColor(getPurple() as ColorResolvable)
	.setAuthor({name: "@" + username, iconURL: author.avatarURL()})
	.setDescription(content)
}