import { Client, TextChannel, Interaction, ChatInputCommandInteraction, ClientPresenceStatus, Guild, ActivityType } from 'discord.js';
import { ReadableEvent } from '../classes';
import { config, roles } from '../config';
import { TimeControl } from '../redis/entities';
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
        corndog.user.setActivity({
            name: "with my tail! :3",
            type: ActivityType.Playing,
            url: "https://www.youtube.com/watch?v=7Ukoh6d4UVg"
        })
        await redisClient.open(process.env.REDIS_URL)
        const guild = (await corndog.guilds.cache.get(config.guildId).fetch())
    }
)
