import { Message } from "discord.js";
import { hasSauce } from ".";

export const getLink = (message: Message) => message.cleanContent.match(hasSauce)