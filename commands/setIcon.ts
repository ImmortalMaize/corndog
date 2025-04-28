import ReadableCommand from "../classes/ReadableCommand";
import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionType, InteractionResponse, Guild, GuildMember, GuildMemberRoleManager } from 'discord.js';
import { roles, users } from "../config";
import { meow, woof, emote, time } from "../utils";
import { userMention } from 'discord.js';

export default new ReadableCommand(new SlashCommandBuilder().setName("setIcon").setDescription("Give or remove an icon if you have the correct role"), async (interaction: ChatInputCommandInteraction) => {
    const hypergeekIconRole = roles["hypergeek icon"];
    //const setIcon = interaction.options.getUser("setIcon")
    const hypergeekRole = roles["hypergeek"]; 
    const member = interaction.member;

    //@ts-ignore
    const check = member.roles.cache.has(hypergeekRole);

    if (check && (member.user.id === users.maize || member.user.id === users.choptop84)) {
        if (!member) {
            interaction.reply({
                content: "what.",
                ephemeral: true
            })
            return
        }
        interaction.guild.members.fetch()
        .then(
            members => members.each(mem => {
                if (mem.roles.cache.has(hypergeekIconRole)) { 
                    mem.roles.remove(hypergeekIconRole)
                    interaction.reply(`${woof()}! Got that icon off of you! ${emote("elated")}`)
                } else {
                    mem.roles.add(hypergeekIconRole)
                    interaction.reply(`${meow()}! Here ya go! ${emote("cat")}`)
                }
            })
        )
        .catch(
            async () => {
                interaction.reply("If you're seeing this then even I don't know ")
            }
        )
        console.log("Who: " + member, ", What: " +  hypergeekIconRole)
    } else {
        if (!(member.user.id === users.maize || member.user.id === users.choptop84)) {
        interaction.reply(`No`)
        } else {
        interaction.reply(`${woof()}..? Erm... Yous not hypergeek! ${emote("malcontent")}`) 
        }
    }
    
})