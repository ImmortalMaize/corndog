export const impartial = async (partial: {
	partial: boolean
	fetch: () => Promise<any>
}): Promise<any> => partial.partial ? await partial.fetch() : partial