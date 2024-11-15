import { SlashCommandBuilder } from "discord.js";
import { Corndog } from "..";

export default class ReadableCommand<Builder = SlashCommandBuilder> {
    constructor(
    public data: Builder,
    public execute: (interaction: any, corndog?: Corndog) => Promise<void>) {}
}