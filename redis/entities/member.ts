import { Entity, Schema, Repository } from 'redis-om'
import client from '../index'

class Member extends Entity { }
const schema = new Schema(
    Member,
    {
        id: { type: 'string' },
        roles: { type: 'string[]' }
    },
    {
        dataStructure: 'JSON'
    }
)

interface Member {
    id: string,
    roles: string[]
}

export default {
    generate: async (form: Member) => {
        const repository: Repository<Member> = client.fetchRepository(schema)
        const member: Member = repository.createEntity()

        member.id = form.id
        member.roles = form.roles

        await repository.save(member)

        console.log("Did it work?")
    },
    search: async (key: keyof Member, value: string) => {
        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        const results = await repository
        .search()
        .where(key)
        .equals(value).return.first().catch((reason => console.log(reason)))

        return results
    },
    save: async (member: Member) => {
        const repository = client.fetchRepository(schema)
        await repository.createIndex()

        await repository.save(member)
    }
}