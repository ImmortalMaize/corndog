import { Entity, Schema, Repository } from 'redis-om';
import utils from '../../utils';
import client from "../index"

interface TimeControl {
    name: string,
    cooldown: Date,
}
type TimeTable = Map<string, () => Promise<any>>
class TimeControl extends Entity {}
const schema = new Schema(
    TimeControl,
    {
        name: {type: "string"},
        cooldown: {type: "date"}
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
        const timeControlId: string = await repository.search().where("name").equals(name).return.firstId()

        await repository.remove(timeControlId)
        
        await client.close()
    },
    async check(table: TimeTable) {
        await client.open(process.env.REDIS_URL)

        const repository: Repository<TimeControl> = client.fetchRepository(schema)
        const all = await repository.search().all()

        for (const timeControl of all) {
            if (utils.time.past(timeControl.cooldown)) {
                const whenRemove = table.get(timeControl.name)
                if (whenRemove) await whenRemove()
                await repository.remove(timeControl.entityId)
            }
        }
    }
}