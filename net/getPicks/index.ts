import { request } from "undici"
import utils from "../../utils"

export default async function getPicks() {
	const { DATA_URL } = process.env
	const weekAgo = utils.time.goBack(1, "week")

	const query = `MATCH (b: Beep) WHERE b.published > date({year: ${weekAgo.year()}, month: ${weekAgo.month()+1}, day: ${weekAgo.date()}}) MATCH (a: User)-[:MADE]->(b)<-[l:LIKED]-(:User) MATCH (b)-[s:SUBMITTED_TO]->(:Sheet) RETURN a.username as author, b.sauce as sauce, b.published as published, count(l) as score, s.caption as caption ORDER BY score DESC`

	console.log(query)
	console.log("Getting beeps from after " + weekAgo.format("YYYY-MM-DD"))
	const table = await request(DATA_URL + 'content/table', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query
		})
	})
	const data = await table.body.json()
	console.log(data)
}