import { User } from "discord.js";
import { channels } from "../../config";
import { emote, woof } from "../../utils";

export default async (user: User, action: {
    name: string,
    description: string
}) => {
    const {name, description} = action
    await user.createDM().then(dm => dm.send(`${woof()}... <@${user.id}>, you have been granted a ${name} for the following reason.\n> ${description}\n In the future, please make sure to follow server and channel rules. Server-wide rules are listed in <#${channels["rules"]}>, while channel-specific rules can be found in the channel description. You can appeal the ban [here](https://forms.gle/y2sHb3Tzcha5zxX47), but it's probably best to give it time. Thank you! ${emote("furry")}`))
}