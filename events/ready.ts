import { Client, TextChannel, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { ReadableEvent } from '../classes';
import { config } from '../config';
import { timeControl } from '../redis/entities';
import utils from '../utils/'

export default new ReadableEvent(
    'ready', 
    async (client: Client) => {
        console.log("Woof! :3")

        timeControl.resume(new Map([
            ["test", async (timeControl) => {
                const guild = (await client.guilds.cache.get(config.guildId).fetch())
                const channels = await guild.channels.fetch()
        
                const commands = channels.get(timeControl.channel) as TextChannel
        
                commands.send("Time control resumption looks good too!")
            }]
        ]))
    },
    true
)