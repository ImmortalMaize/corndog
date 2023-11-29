import { Client, TextChannel, Interaction, ChatInputCommandInteraction, ClientPresenceStatus } from 'discord.js';
import { ReadableEvent } from '../classes';
import { config, roles } from '../config';
import { timeControl } from '../redis/entities';
import redisClient from "../redis"
import { time } from '../utils';

export default new ReadableEvent(
    'ready', 
    async (corndog: Client) => {
        const { STATUS } = process.env
        console.log("Woof! :3")
        corndog.user.setStatus(STATUS as ClientPresenceStatus)

        await redisClient.open(process.env.REDIS_URL)
        const guild = (await corndog.guilds.cache.get(config.guildId).fetch())

        guild.setBanner("https://paintbox.thurm64.repl.co/test.png")
        setInterval(() => guild.setBanner("https://paintbox.thurm64.repl.co/test.png"), time.duration({ hours: 1}))
        
        timeControl.resume(new Map([
            ["test", async (timeControl) => {
                const channels = await guild.channels.fetch()
        
                const commands = channels.get(timeControl.channel) as TextChannel
        
                commands.send("Time control resumption looks good too!")
            }],
            ["yoink", async () => {}]
        ]))
    },
    true
)
