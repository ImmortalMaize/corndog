import { Entity, Schema } from 'redis-om'
import { Inventory } from '../classes'
import client from '../index'

class Report extends Entity { }
const schema = new Schema(
	Report,
	{
		type: { type: 'string'},
		id: { type: 'string' },
		resolved: { type: 'boolean' },
		link: { type: 'string' },
		mod: { type: 'string' },
		content: { type: 'string' }
	},
	{
		dataStructure: 'JSON'
	}
)

interface ReportProps {
	type: string,
	id: string,
	resolved: boolean,
	link: string,
	mod: string,
	content: string,
	user: string
}

interface Report extends Entity, ReportProps {}

export default new Inventory(client, schema) as Inventory<ReportProps>