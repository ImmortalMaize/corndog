import { Entity, Schema, Repository } from 'redis-om'
import client from '../index'

class Fav extends Entity { }
const schema = new Schema(
    Fav,
    {
        user: { type: 'string' },
        sauce: { type: 'string' },
        name: { type: 'string' }
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
    search: async (user: string, key: keyof Fav, value: string) => {
        await client.open(process.env.REDIS_URL)

        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        const results = await repository
        .search()
        .where(key)
        .equals(value)
        .and("user")
        .equals(user)
        .return.first().catch((reason => console.log(reason)))

        await client.close()
        return results
    },
    all: async (user: string, offset: number) => {
        await client.open(process.env.REDIS_URL)
        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        const results = await repository
        .search()
        .where("user")
        .equals(user)
        .page(5*offset - 1, 5)
        .catch((reason => console.log(reason)))

        await client.close()
        return results as Fav[]

    }
}