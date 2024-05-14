import { request } from "undici"

export const updateOne = async (model: string, id: string, patch: {}) => {
	const { DATA_URL } = process.env
	const contentType = {'Content-Type': 'application/json'}
	const update = await request(DATA_URL + "content/" + model + "/primary" + id, {
		method: "PATCH",
		headers: {
			...contentType
		},
		body: JSON.stringify(patch)
	})
	console.log(update)
}