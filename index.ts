import env from "dotenv"
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'

env.config()

import { Client, Collection, GatewayIntentBits, Partials, TextChannel, ChatInputCommandInteraction } from "discord.js"
import utils from "./utils"
import { ReadableEvent } from "./classes"
import ReadableRoute from "./classes/ReadableRoute"

const { Guilds, GuildMessageReactions, GuildMessages, GuildMembers, GuildPresences, GuildMessageTyping, GuildEmojisAndStickers, MessageContent } = GatewayIntentBits
const { Message, Channel, Reaction, User } = Partials

const app = express()

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
client.commands = new Collection(); client.app = app
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

async function getCommands() {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(filePath)).default

        // @ts-ignore
        client.commands.set(command.data.name, command);
        console.log(`Loaded command ${command.data.name} ${utils.emote("content")}`)
    }
}

getCommands()

async function getEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file)
        const event = (await import(filePath)).default as ReadableEvent
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args).catch((error: Error) => console.log(error)));
        }
        console.log(`Loaded event ${event.name} ${utils.emote("content")}`)
    }
}

getEvents()

async function getRoutes() {
    const routesPath = path.join(__dirname, 'routes');
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.ts'));

    for (const file of routeFiles) {
        const filePath = path.join(routesPath, file)
        const route = (await import(filePath)).default as ReadableRoute
        const iRoute = app.route(route.path)
        for (const handler in route.handlers) {
            iRoute[handler](route.handlers[handler])
        }
        const methods = Object.keys(route.handlers).map(method => `"${method.toUpperCase()}"`)
        console.log(`Loaded method${methods.length > 1 ? "s": ""} ${utils.enumerate(methods, true)} for route "${route.path}" ${utils.emote("content")}`)
    }
}

getRoutes()

const port = 1000
app.listen(port, () => {
    console.log(`Listening on port ${port}! Hello world! ${utils.emote("elated")}`)
})

