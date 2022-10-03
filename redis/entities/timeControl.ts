import { Entity, Schema, Repository } from 'redis-om';
import utils from '../../utils';
import client from "../index"

interface TimeControl {
    channel: string,
    message: string,
    name: string,
    cooldown: Date,
}

type TimeTable = Map<string, (timeControl: TimeControl) => Promise<void>>
class TimeControl extends Entity { }
const schema = new Schema(
    TimeControl,
    {
        channel: { type: "string" },
        message: { type: "string" },
        name: { type: "string" },
        cooldown: { type: "date" }
    },
    {
        dataStructure: "JSON"
    }
)

export default {
    async generate(form: TimeControl) {
        await client.open(process.env.REDIS_URL)

        const repository: Repository<TimeControl> = client.fetchRepository(schema)
        const timeControl: TimeControl = repository.createEntity()

        timeControl.name = form.name
        timeControl.cooldown = form.cooldown

        await repository.save(timeControl)

        await client.close()
    },
    async waste(name: string) {
        await client.open(process.env.REDIS_URL)

        const repository: Repository<TimeControl> = client.fetchRepository(schema)
        await repository.createIndex()

        const timeControlId: string = await repository.search().where("name").equals(name).return.firstId()

        await repository.remove(timeControlId)

        await client.close()
    },
    async check(name: string, handler?: () => Promise<void>) {
        console.log("Checking time controls!")
        await client.open(process.env.REDIS_URL)

        const repository: Repository<TimeControl> = client.fetchRepository(schema)
        await repository.createIndex()

        const timeControl = await repository.search().where("name").equals(name).return.first()

        if (utils.time.past(timeControl.cooldown)) {
            console.log("Cooldown met: " + timeControl.name + "!")
            if (handler) await handler()

            await repository.remove(timeControl.entityId)
        }
        else {
            console.log("Cooldown of " + timeControl.name + " not met...")
        }

        await client.close()
    },

    async resume(table: TimeTable) {
        await client.open(process.env.REDIS_URL)

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
                    if (utils.time.past(timeControl.cooldown)) {
                        console.log("Cooldown met: " + timeControl.name + "!")
                        const handler = table.get(timeControl.name)

                        if (handler) await handler(timeControl)
                        await repository.remove(timeControl.entityId)
                    }
                    else {
                        console.log("Cooldown of " + timeControl.name + " not met...")
                    }
                }
            }, 1000)
        }
        else {
            console.log("Time controls are clear.")
        }
    }
}