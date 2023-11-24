export const impartial = async (partial: {
	partial: boolean
	fetch: () => Promise<any>
}): Promise<any> => { if (partial.partial) return await partial.fetch() }