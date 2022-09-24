import { Client } from 'discord.js';

export default class ReadableEvent {
    constructor(
        public name: string,
        public execute: (...input: any) => Promise<void>,
        public once?: boolean
    ) {}
}