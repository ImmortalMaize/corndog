import { Client, Entity, Schema } from "redis-om";

export default class Inventory<Form> {
    constructor(
        public client: Client,
        public schema: Schema<Form & Entity>,
    ) {}
    public generate: (form: Form) => Promise<Form & Entity> = async (form: Form) => {
        const repository = this.client.fetchRepository(this.schema)
        const item = repository.createEntity()

        Object.assign(item, form)
        await repository.save(item)

        console.log("Did it work?")
        return item
    }
    public get: (key: string & keyof (Form & Entity), value: string) => Promise<Form & Entity|void> = async (key: string & keyof Form, value: any) => {
        const repository = this.client.fetchRepository(this.schema)
        await repository.createIndex()

        const results = await repository
        .search()
        .where(key)
        .equals(value).return.first().catch((reason => console.log(reason)))

        return results
    }
    public view: () => Promise<Array<Form & Entity>> = async () => {
        const repository = this.client.fetchRepository(this.schema)
        await repository.createIndex()

        const items = await repository
        .search()
        .returnAll()

        return items
    }
    public amend: (id: string, amendments: Array<[string & keyof (Form & Entity), any]>) => Promise<Form & Entity|void> = async (id: string, amendments: Array<[string & keyof Form, any]>) => {
        const repository = this.client.fetchRepository(this.schema)
        await repository.createIndex()

        const item = await repository.fetch(id)
        if (!item) return null

        for (const [key, value] of amendments) {
            item[key] = value
        }
        if (item.entityId) await repository.save(item)
        return item
    }
    public waste: (id: string) => Promise<void> = async (id: string) => {
        const repository = this.client.fetchRepository(this.schema)
        await repository.createIndex()

        await repository.remove(id)
    }
}