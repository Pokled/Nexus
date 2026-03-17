import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
    // On récupère le token et les infos utilisateur du layout parent
    // pour s'assurer que l'admin est bien connecté avant d'afficher la page
    const { user, token } = await parent()
    
    return {
        user,
        token
    }
}