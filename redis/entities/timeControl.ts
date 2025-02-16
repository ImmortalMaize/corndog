import { Entity, Schema, Repository } from 'redis-om';
import { time } from '../../utils';
import client from "../index"
import { Inventory } from '../classes';

interface TimeControl {
    channel: string,
    message: string,
    name: string,
}

type TimeTable = Map<string, (timeControl: TimeControl) => Promise<void>>
class TimeControl extends Entity { }
const schema = new Schema(
    TimeControl,
    {
        channel: { type: "string" },
        message: { type: "string" },
        name: { type: "string" },
    },
    {
        dataStructure: "JSON"
    }
)


class TimeControlInventory extends Inventory<TimeControl> {
    constructor() {
        super(client, schema)
    }

    async check(name: string, handler?: () => Promise<void>, logs?: boolean): Promise<boolean> {
        if (logs) console.log("Checking time controls!")

        const repository: Repository<TimeControl> = client.fetchRepository(schema)
        await repository.createIndex()

        const timeControl = await repository.search().where("name").equals(name).return.first()
        console.log(timeControl)
        if (!timeControl) {
            if (logs) console.log("No such cooldown!")
            if (handler) await handler()
            return true
        }
    }
}

export default new TimeControlInventory()