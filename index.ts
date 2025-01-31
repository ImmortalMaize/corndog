import env from "dotenv"
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'

env.config()

import { Client, Collection, GatewayIntentBits, Partials, TextChannel, ChatInputCommandInteraction, ClientPresenceStatus } from "discord.js"
import { emote, tracer, enumerate } from "./utils"
import { ReadableCommand, ReadableEvent } from "./classes"
import ReadableRoute from "./classes/ReadableRoute"
import socket from "./socket"
import { Socket } from "socket.io-client"
import { file } from "googleapis/build/src/apis/file"

const { Guilds, GuildMessageReactions, GuildMessages, GuildMembers, GuildPresences, GuildMessageTyping, GuildEmojisAndStickers, MessageContent } = GatewayIntentBits
const { Message, Channel, Reaction, User } = Partials

const app = express()

export interface Corndog extends Client {
    commands?: Collection<string, ReadableCommand>
    app?: express.Application
    socket?: Socket
}

const corndog: Corndog = new Client({
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
})

const { CLIENT_TOKEN, STATUS } = process.env

corndog.login(CLIENT_TOKEN)
const extension = __filename.split(".").pop() === 'ts' ? '.ts' : '.js'

corndog.commands = new Collection(); corndog.app = app; corndog.socket = socket()

async function getCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(content => {
        if (content.endsWith(extension)) return content
        const folder = fs.readdirSync(commandsPath + "/" + content)
        if (folder.some(file => file === ("index" + extension))) return content
    });

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(filePath)).default

        corndog.commands.set(command.data.name, command);
        tracer.build(`Loaded command ${command.data.name} ${emote("content")}`)
    }
}

getCommands()

async function getMenus() {
    const menusPath = path.join(__dirname, 'menus');
    const menuFiles = fs.readdirSync(menusPath).filter(file => file.endsWith(extension));

    for (const file of menuFiles) {
        const filePath = path.join(menusPath, file);
        const menu = (await import(filePath)).default

        
        corndog.commands.set(menu.data.name, menu);
        tracer.build(`Loaded menu ${menu.data.name} ${emote("content")}`)
    }
}

getMenus()

async function getEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(content => {
        if (content.endsWith(extension)) return content
        const folder = fs.readdirSync(eventsPath + "/" + content)
        if (folder.some(file => file === ("index" + extension))) return content
    });
    
    console.log(fs.readdirSync(eventsPath))

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file)
        const event = (await import(filePath)).default as ReadableEvent
        if (event.once) {
            corndog.once(event.name, (...args) => event.execute(...args));
        } else {
            corndog.on(event.name, (...args) => event.execute(...args).catch((error: Error) => void tracer.error(error)));
        }
        tracer.build(`Loaded event ${event.name} ${emote("content")}`)
    }
}

getEvents()

async function getRoutes() {
    const routesPath = path.join(__dirname, 'routes');
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith(extension));

    for (const file of routeFiles) {
        const filePath = path.join(routesPath, file)
        const route = (await import(filePath)).default as ReadableRoute
        const appRoute = app.route(route.path)
        for (const handler in route.handlers) {
            appRoute[handler](route.handlers[handler])
        }

        const methods = Object.keys(route.handlers).map(method => `"${method.toUpperCase()}"`)
        tracer.build(`Loaded method${methods.length > 1 ? "s": ""} ${enumerate(methods, true)} for route "${route.path}" ${emote("content")}`)
    }
}

getRoutes()

const port = 5000
app.listen(port, () => {
    tracer.build(`Listening on port ${port}! Hello world! ${emote("elated")}`)
})