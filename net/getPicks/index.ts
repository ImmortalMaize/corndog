import { ManipulateType } from "dayjs"
import { request } from "undici"
import { config, picks } from "../../config"
import { time } from "../../utils"

export default async function getPicks(period: ManipulateType) {
	const { DATA_URL } = process.env
	const { clientId } = config
	const { quota } = picks
	const thisPeriod = time.startOf(period)

	const query = `MATCH (b: Beep) WHERE b.published > date({year: ${thisPeriod.year()}, month: ${thisPeriod.month()+1}, day: ${thisPeriod.date()}}) MATCH (a: User)-[:MADE]->(b) MATCH (b)<-[l:LIKED]-(u:User) WHERE NOT (u.discordId = a.discordId) AND NOT (u.discordId  = ${clientId}) MATCH (b)-[s:SUBMITTED_TO]->(:Sheet) RETURN a.username as author, b.sauce as sauce, b.published as published, s.caption as caption, count(l) as score ORDER BY score DESC LIMIT ${quota}`

	console.log(query)
	console.log("Getting beeps from after " + thisPeriod.format("YYYY-MM-DD"))
	const table = await request(DATA_URL + 'content/table', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query
		})
	});
	const results = await table.body.json() as {
		author: string,
		sauce: string,
		published: {
			day: {
				low: number,
				high: number
			},
			month: {
				low: number,
				high: number
				},
			year: {
				low: number,
				high: number
			}
		},
		score: {
			low: number,
			high: number
		},
		caption: string
	}[]
	return results
}