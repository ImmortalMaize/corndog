import { Client, TextChannel, Interaction, ChatInputCommandInteraction, ClientPresenceStatus, Guild } from 'discord.js';
import { ReadableEvent } from '../classes';
import { config, roles } from '../config';
import { timeControl } from '../redis/entities';
import redisClient from "../redis"
import { emote, time, tracer } from '../utils';

const updatePaintbox = async (guild: Guild) => {
    guild.setBanner("https://paintbox.thurm64.repl.co/test.png").catch(() => tracer.error( `Could not set banner to latest paintbox update! ${emote("malcontent")}`)).then(() => tracer.control(`Banner set to latest paintbox update! ${emote("elated")}`))
}

export default new ReadableEvent(
    'ready', 
    async (corndog: Client) => {
        const { STATUS } = process.env
        tracer.woof("Woof! :3")
        corndog.user.setStatus(STATUS as ClientPresenceStatus)

        await redisClient.open(process.env.REDIS_URL)
        const guild = (await corndog.guilds.cache.get(config.guildId).fetch())

        await updatePaintbox(guild)
        setInterval(async () => await updatePaintbox(guild), time.duration({ minutes: 1}))
        
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
