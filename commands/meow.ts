import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from "discord.js";
import { ReadableCommand } from "../classes";
import utils from "../utils";

export default new ReadableCommand(
    new SlashCommandBuilder().setName('meow').setDescription('Uuugh... >_>'),
    async (interaction: ChatInputCommandInteraction) => {
        const no = ["No", "Non", "Haram", "T-that's haram..", "Nope", "حَرَام", "Hélas non", "Please no", "P-please", "I refuse..", "pls..", "I'm begging you.."]
        const meow = ["Meow", "Miaou", "Miaouw", "Miaouuu", "Miaouuuu", "Miaouuuuu", "Miaouuuuuuuuuu", "にゃ", "ニャー", "にゃあ", "Nyan", "Nyan~", "Nyaa~", "Mrrrow", "Fine... meow", "Meow! MOOOW", "Meow! MEOOOOW", "Meow! MIAOUUUU", "NOOOOO meow"]
        const randomNo = no[Math.floor(Math.random() * no.length)]
        const randomMeow = meow[Math.floor(Math.random() * meow.length)]
        const random = Math.floor(Math.random() * 100)
        console.log(random)
        const response = (random >= 80)||interaction.member.user.id === "143866772360134656" ? `${randomMeow}! ${utils.emote('cat')}` : `${randomNo}. ${utils.emote('neutral')}`
        await interaction.reply(`${response}`)
    }
)