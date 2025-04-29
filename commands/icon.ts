import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { roles  } from "../config";
import { woof, meow, emote, getMember } from "../utils";

export default new ReadableCommand(new SlashCommandBuilder().setName("icon").setDescription("Get yourself an icon here"), async (interaction: ChatInputCommandInteraction) => {
    const { options, guild } = interaction
    const member = await getMember(guild.members, options.getUser("member").id)
    const hypergeekIconRole = roles["hypergeek icon"];
    const hypergeekRole = roles["hypergeek"];

    console.log("Member: " + member + " hypergeekIconRole: "+hypergeekIconRole+" hypergeekRole: " + hypergeekRole);
    console.log("Member: " + member + " hypergeekIconRole: "+hypergeekIconRole+" hypergeekRole: " + hypergeekRole);

    if (!member) {
        interaction.reply({
            content: "You don't exist",
            ephemeral: true
        })
        return
    }

    try { 
        console.log("Step one do thing. Does user have role? " + Boolean(member.roles.cache.some(role => role.id === hypergeekRole)));
        if (member.roles.cache.some(role => role.id === hypergeekRole)) {
            console.log("Step two does the user have the other role? " + Boolean(member.roles.cache.some(role => role.id === hypergeekIconRole)));
            if (member.roles.cache.some(role => role.id === hypergeekIconRole)) { 
                member.roles.remove(hypergeekIconRole);
                interaction.reply(`${meow()}! Mine now omnomnom..! ${emote("cat")}`);
                console.log("Step three did I give/remove said role? " + Boolean(member.roles.cache.some(role => role.id === hypergeekIconRole)));
            } else { 
                member.roles.add(hypergeekIconRole);
                interaction.reply(`${woof()}! Here ya go~! ${emote("elated")}`);
                console.log("Step three did I give/remove said role? " + Boolean(member.roles.cache.some(role => role.id === hypergeekIconRole)));
            }
        } else {
            interaction.reply(`No`)
            console.log("Among us??");
        }
    } catch (error) {
        console.log("Something fishy is going on... " + error);
        interaction.reply(`Erm what the heck`)
    }

})