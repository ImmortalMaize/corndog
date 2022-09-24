import { Interaction, Message, SlashCommandBuilder } from 'discord.js';

export default class ReadableCommand {
    constructor(
    public data: SlashCommandBuilder,
    public execute: (interaction: Interaction|Message) => Promise<void>) {}
}