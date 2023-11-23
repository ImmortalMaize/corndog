import { Entity, Schema } from 'redis-om'
import { Inventory } from '../classes'
import client from '../index'

class Member extends Entity { }
const schema = new Schema(
    Member,
    {
        id: { type: 'string' },
        roles: { type: 'string[]' },
        dug: { type: 'string[]'},
        "picks pings": { type: 'boolean' },
        "picks scope number": { type: 'number' },
        "picks scope unit": { type: 'string' }
    },
    {
        dataStructure: 'JSON'
    }
)

interface MemberProps {
    id: string,
    roles?: string[]
    dug?: string[]
    "picks pings"?: boolean
    "picks scope number"?: number
    "picks scope unit"?: "days" | "weeks" | "months" | "years"
}

interface Member extends Entity, MemberProps {}

export default new Inventory(client, schema) as Inventory<MemberProps>