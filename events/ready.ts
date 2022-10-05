import { Client, TextChannel, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { ReadableEvent } from '../classes';
import { config, misc } from '../config';
import { timeControl } from '../redis/entities';
import redisClient from "../redis"
import utils from '../utils/'

export default new ReadableEvent(
    'ready', 
    async (client: Client) => {
        console.log("Woof! :3")
        await redisClient.open(process.env.REDIS_URL)

        const guild = (await client.guilds.cache.get(config.guildId).fetch())
        guild.members.cache.get(config.clientId).roles.add("785926948530028584")
        
        timeControl.resume(new Map([
            ["test", async (timeControl) => {
                const channels = await guild.channels.fetch()
        
                const commands = channels.get(timeControl.channel) as TextChannel
        
                commands.send("Time control resumption looks good too!")
            }],
            ["yoink", async (timeControl) => {
                (await guild.roles.fetch()).get(misc["some role idk"]).members.clear()
            }]
        ]))
    },
    true
)