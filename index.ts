import env from "dotenv"
import fs from 'node:fs'
import path from 'node:path'

env.config()

import { Client, Collection, GatewayIntentBits, Partials } from "discord.js"

const { Guilds, GuildMessageReactions, GuildMessages, GuildMembers, GuildPresences, GuildMessageTyping, GuildEmojisAndStickers, MessageContent } = GatewayIntentBits
const { Message, Channel, Reaction, User } = Partials

const client = new Client({
    intents: [
        Guilds,
        GuildMessageReactions,
        GuildMessages,
        GuildMembers,
        GuildPresences,
        GuildMessageTyping,
        MessageContent
    ],
    partials: [
        Message,
        Channel,
        Reaction,
        User
    ]
});

const { CLIENT_TOKEN } = process.env

client.login(CLIENT_TOKEN)

// @ts-ignore
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

async function getCommands() {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(filePath)).default

        // @ts-ignore
        client.commands.set(command.data.name, command);
    }
}

getCommands()

async function getEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file)
        const event = (await import(filePath)).default
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

getEvents()