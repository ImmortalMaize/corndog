import { Entity, Schema, Repository } from 'redis-om'
import { Inventory } from '../classes'
import client from '../index'

class Member extends Entity { }
const schema = new Schema(
    Member,
    {
        id: { type: 'string' },
        roles: { type: 'string[]' },
        "picks pings": { type: 'boolean' }
    },
    {
        dataStructure: 'JSON'
    }
)

interface MemberProps {
    id: string,
    roles: string[]
    "picks pings": boolean
}

interface Member extends Entity, MemberProps {}

export default new Inventory(client, schema) as Inventory<MemberProps>