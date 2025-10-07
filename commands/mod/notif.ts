import { ChannelType, GuildChannelManager, TextChannel, ThreadChannel, User } from "discord.js";
import { channels } from "../../config";
import { getChannel } from './../../utils/getChannel';
import { emote, woof } from "../../utils";

export default async (channelManager: GuildChannelManager, user: User, action: {
    name: string,
    description: string
}) => {
    const channel: TextChannel = await getChannel(channelManager, channels["staff-notifs"]) as TextChannel
    const {name, description} = action
    const threads = await channel.threads.fetch()
    let userThread: ThreadChannel = threads.threads.find(thread => thread.name.includes(user.id))
    if (!userThread) userThread = await channel.threads.create({
        name: `${user.username} (${user.id})`,
        type: ChannelType.PrivateThread
    }).then(thread => thread.members.add(user.id).then(() => thread))
    
    await userThread.send(`${woof()}... <@${user.id}>, you have been granted a ${name} for the following reason.\n> ${description}\n In the future, please make sure to follow server and channel rules. Server-wide rules are listed in <#${channels["rules"]}>, while channel-specific rules can be found in the channel description. For any questions or concerns, contact a moderator or submit a ticket. Thank you! ${emote("furry")}`)
}