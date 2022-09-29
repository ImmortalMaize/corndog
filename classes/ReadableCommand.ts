import { Interaction, Message, SlashCommandBuilder } from 'discord.js';

export default class ReadableCommand {
    constructor(
    public data: any,
    public execute: (interaction: any) => Promise<void>) {}
}