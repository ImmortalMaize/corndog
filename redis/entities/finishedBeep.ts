import { Entity, Schema, Repository } from 'redis-om'
import client from '../index'

class FinishedBeep extends Entity { }
const schema = new Schema(
    FinishedBeep,
    {
        submission: { type: 'string' },
        embed: { type: 'string' },
        count: { type: 'number' },
        date: { type: 'date' }
    },
    {
        dataStructure: 'JSON'
    }
)

interface FinishedBeepProps {
    submission: string,
    embed: string,
    count: number,
    date: Date
}
interface FinishedBeep extends Entity, FinishedBeepProps {
    
}

export default {
    generate: async (form: FinishedBeepProps) => {
        const repository = client.fetchRepository(schema)
        const finishedBeep = repository.createEntity()

        finishedBeep.embed = form.embed
        finishedBeep.submission = form.submission
        finishedBeep.count = form.count
        finishedBeep.date = form.date

        await repository.save(finishedBeep)

        console.log("Did it work?")
    },
    search: async (key: keyof FinishedBeep, value: string) => {
        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        const results = await repository
        .search()
        .where(key)
        .equals(value).return.first().catch((reason => console.log(reason)))

        return results
    },
    view: async () => {
        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        const results = await repository
        .search()
        .returnAll()

        return results
    },
    amend: async (id: string, amendments: Array<[keyof FinishedBeepProps, any]>) => {
        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        const item = await repository.fetch(id)
        if (!item) return null

        for (const [key, value] of amendments) {
            //@ts-ignore
            item[key] = value
        }
        if (item.entityId) await repository.save(item)
        return item
    }
}