import { Client } from 'discord.js';
import { ReadableEvent } from '../classes';
import utils from '../utils/'

export default new ReadableEvent(
    'ready', 
    async (client: Client) => {
        console.log("Woof! :3")
    },
    true
)