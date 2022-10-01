import { Entity, Schema, Repository } from 'redis-om'
import client from '../index'

class FinishedBeep extends Entity { }
const schema = new Schema(
    FinishedBeep,
    {
        submission: { type: 'string' },
        embed: { type: 'string' }
    },
    {
        dataStructure: 'JSON'
    }
)

interface FinishedBeep {
    submission: string,
    embed: string
}

export default {
    generate: async (form: FinishedBeep) => {
        await client.open(process.env.REDIS_URL)

        const repository = client.fetchRepository(schema)
        const finishedBeep = repository.createEntity()

        finishedBeep.embed = form.embed
        finishedBeep.submission = form.submission

        await repository.save(finishedBeep)
        await client.close()

        console.log("Did it work?")
    },
    search: async (key: keyof FinishedBeep, value: string) => {
        await client.open(process.env.REDIS_URL)

        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        const results = await repository
        .search()
        .where(key)
        .equals(value).return.first().catch((reason => console.log(reason)))

        await client.close()
        return results
    }
}