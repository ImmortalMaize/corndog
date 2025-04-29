import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { roles  } from "../config";
import { woof, meow, emote, getMember } from "../utils";

export default new ReadableCommand(new SlashCommandBuilder().setName("icon").setDescription("Get yourself an icon here"), async (interaction: ChatInputCommandInteraction) => {
    const { options, guild } = interaction
    const member = await getMember(guild.members, options.getUser("member").id)
    const hypergeekIconRole = roles["hypergeek icon"]
    const hypergeekRole = roles["hypergeek"]

    if (!member) {
        interaction.reply({
            content: "You don't exist",
            ephemeral: true
        })
        return
    }

    if (member.roles.cache.some(role => role.id === hypergeekRole)) {
        if (member.roles.cache.some(role => role.id === hypergeekIconRole)) { 
            member.roles.remove(hypergeekIconRole) 
            interaction.reply(`${meow()}! Mine now omnomnom..! ${emote("cat")}`)
        } else { 
            member.roles.add(hypergeekIconRole);
            interaction.reply(`${woof()}! Here ya go~! ${emote("elated")}`)
        }
        
    } else {
        interaction.reply(`No`)
    }
    

})