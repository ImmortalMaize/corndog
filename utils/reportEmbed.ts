import { ColorResolvable, EmbedBuilder, GuildMember, User} from "discord.js";
import { getPurple } from "./getPurple";

export const reportEmbed = (
	author: {
		username: string
		avatar: string
		avatarURL: () => string
	},
	content: string
) => {
	console.log(author)
	const username = author.username

	return new EmbedBuilder()
	.setColor(getPurple() as ColorResolvable)
	.setAuthor({name: "@" + username, iconURL: author.avatarURL()})
	.setDescription(content)
}