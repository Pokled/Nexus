import type { PageServerLoad } from './$types'
// Stats already fetched in layout — reuse from parent
export const load: PageServerLoad = async ({ parent }) => {
	const { stats } = await parent()
	return { stats }
}
