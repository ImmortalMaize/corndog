import { REST, SlashCommandBuilder, Routes, SlashCommandSubcommandBuilder } from 'discord.js'

//@ts-ignore
import { clientId, guildId } from "./config/config.json"
import fs from 'node:fs'
import path from 'node:path'
import env from 'dotenv'
env.config()

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

async function getCommands() {
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		await import(filePath).then(command => {
			commands.push(command.default.data.toJSON())
		})
	}
}

const menusPath = path.join(__dirname, 'menus');
const menuFiles = fs.readdirSync(menusPath).filter(file => file.endsWith('.ts'));

async function getMenus() {
	for (const file of menuFiles) {
		const filePath = path.join(menusPath, file);
		await import(filePath).then(menu => {
			commands.push(menu.default.data.toJSON())
		})
	}
}


async function deployCommands() {
await getCommands()
await getMenus()
const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN as string);


await rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then((data) => console.log(`Successfully registered ${(data as Array<any>).length} application commands.`))
	.catch(console.error)
}

deployCommands()