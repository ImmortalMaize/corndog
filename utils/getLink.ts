import { Message } from "discord.js";
import utils from ".";

export default (message: Message) => message.cleanContent.match(utils.hasSauce)