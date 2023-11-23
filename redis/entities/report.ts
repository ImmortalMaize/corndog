import { Entity, Schema } from 'redis-om'
import { Inventory } from '../classes'
import client from '../index'

class Report extends Entity { }
const schema = new Schema(
	Report,
	{
		id: { type: 'string' },
		resolved: { type: 'boolean' },
		link: { type: 'string' },
		mod: { type: 'string' }
	},
	{
		dataStructure: 'JSON'
	}
)

interface ReportProps {
	id: string,
	resolved: boolean,
	link: string,
	mod: string
}

interface Report extends Entity, ReportProps {}

export default new Inventory(client, schema) as Inventory<ReportProps>