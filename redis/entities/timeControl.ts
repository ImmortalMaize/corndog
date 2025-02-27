import { Entity, Schema, Repository } from 'redis-om';
import { time } from '../../utils';
import client from "../index"
import { Inventory } from '../classes';

interface TimeControl {
    channel: string,
    message: string,
    name: string,
    cooldown: Date
}

type TimeTable = Map<string, (timeControl: TimeControl) => Promise<void>>
class TimeControl extends Entity { }
const schema = new Schema(
    TimeControl,
    {
        channel: { type: "string" },
        message: { type: "string" },
        name: { type: "string" },
        cooldown: {type: "date"}
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

    async resume(table: TimeTable) {
        const repository: Repository<TimeControl> = client.fetchRepository(schema)
        await repository.createIndex()

        const leftovers = await repository.search().all()
        if (leftovers.length > 0) {
        console.log("There's some unresolved time controls...")
        const interval = setInterval(async () => {
                const timeControls = await repository.search().all()
                if (timeControls.length === 0) {
                    console.log("That's a wrap!")
                    clearInterval(interval)
                    return
                }
                for (const timeControl of timeControls) {
                    if (time.past(timeControl.cooldown)) {
                        console.log("Cooldown met: " + timeControl.name + "!")
                        const handler = table.get(timeControl.name)

                        if (handler) await handler(timeControl)
                        await repository.remove(timeControl.entityId)
                    }
                }
            }, 1000)
        }
        else {
            console.log("Time controls are clear.")
        }
    }
}

export default new TimeControlInventory()