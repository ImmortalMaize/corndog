import { request } from "undici"

export const update = async (model: string, handler: (nodes: {
	discordId: string
}) => Promise<void>) => {
	const { DATA_URL } = process.env
	const endpoint = DATA_URL + "content/" + model
	console.log(endpoint)
	const items = JSON.parse(await (await request(endpoint, {method: "GET"})).body.text()) as Array<{ discordId: string }>
	console.log(items)
	for (const item of items) {
		await handler(item)
	}
}