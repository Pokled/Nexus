import type { PageServerLoad } from './$types'
import { getLocaleActivity, getAllContributors } from '$lib/localeActivity.server'

export const load: PageServerLoad = () => {
	return {
		activity:        getLocaleActivity(),
		allContributors: getAllContributors(),
	}
}
