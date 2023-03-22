import { Entity, Schema, Repository } from 'redis-om'
import { Inventory } from '../classes'
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

export default new Inventory(client, schema) as Inventory<FinishedBeepProps>