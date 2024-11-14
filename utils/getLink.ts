import { Message } from "discord.js";
import { hasUrl } from ".";

export const getLink = (message: Message) => message.cleanContent.match(hasUrl)