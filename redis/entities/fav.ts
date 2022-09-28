import { Entity, Schema, Repository } from 'redis-om'
import client from '../index'

class Fav extends Entity { }
const schema = new Schema(
    Fav,
    {
        submission: { type: 'string' },
        embed: { type: 'string' }
    },
    {
        dataStructure: 'JSON'
    }
)

interface Fav {
    user: string,
    sauce: string,
    name: string
}

export default {
    generate: async (form: Fav) => {
        await client.open(process.env.REDIS_URL)

        const repository = client.fetchRepository(schema)
        const fav = repository.createEntity()

        fav.user = form.user
        fav.sauce = form.sauce
        fav.name = form.name

        await repository.save(fav)
        await client.close()

        console.log("Did it work?")
    },
    search: async (key: keyof Fav, value: string) => {
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