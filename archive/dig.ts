import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { time } from "@discordjs/formatters"
import { ReadableCommand } from "../classes";
import { member, timeControl } from "../redis/entities";
import {time as utilsTime, emote} from '../utils';
import { spots, fails, channels } from '../config'

const spotsMap = new Map<number, string>(spots as Array<[number, string]>)
export default new ReadableCommand(
    new SlashCommandBuilder().setName('dig').setDescription('Dig a hole').addIntegerOption(option => option.setName('spot').setDescription('The spot you want to dig').setRequired(true)),
    async (interaction: ChatInputCommandInteraction) => {
        const spot = Math.abs(interaction.options.getInteger('spot'))
        let user = (await member.get("id", interaction.user.id))
        if (!user) user = await member.generate({ id: interaction.user.id, dug: [] })
        if (!user.dug) user.dug = []
        
        const cooldown = await timeControl.get("dig_" + interaction.user.id)
        const ready = !cooldown
        
        if (user.dug.includes(spot.toString())) {
            await interaction.reply({ content: `You've already dug that spot!`, ephemeral: false })
            return
        }
        if (interaction.channelId !== channels["action"]) {
            await interaction.reply({ content: `You try digging in <#${interaction.channelId}>... only to realize there's no ground to dig! Maybe you should dig in to <#${channels["action"]}>. ${emote("neutral")}`, ephemeral: true })
            return
        }
        if (!ready) {
            await interaction.reply({ content: `You're too tired to dig! Try digging ${time(cooldown.cooldown, "R")}! ${emote('malcontent')}`, ephemeral: false })
            return
        }
        if (spot > 1000 || spot < 1) {
            await interaction.reply({ content: `You can't dig that spot!`, ephemeral: false })
            return
        }
        if (spotsMap.has(spot)) {
            const image = new AttachmentBuilder("assets/" + spotsMap.get(spot) + ".png")
            await interaction.reply({ content: `
You spend a couple of minutes digging as far down as you can, eventually reaching something you can't dig through with your hands. This is as far down as you can go. 

Lying there, at the bottom of the hole you've dug, is a small sliver of paper, which seems to be a damaged image…`,
            files: [image], ephemeral: false })
            member.amend(user.id, [["dug", user.dug.concat([spot.toString()])]])
        }

        else {
            const randomFail = fails[Math.floor(Math.random() * fails.length)]
            await interaction.reply({ content: randomFail + " " + emote("malcontent"), ephemeral: false })
            const newDug = user.dug.concat([spot.toString()])
            
            await member.amend(user.entityId, [["dug", newDug]])   
        }

        //@ts-ignore
        timeControl.generate({
            channel: interaction.channelId,
            message: "",
            cooldown: utilsTime.goForth(1, "minute").toDate(),
            name: "dig_" + interaction.user.id,
        })
    }
)