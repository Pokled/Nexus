// H:\Projets\Nexus\nexus-frontend\src\routes\forum\[category]\ +page.server.ts

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/api';

// Fonction récursive pour chercher une catégorie dans l'arbre
function findCategoryInTree(categories: any[], targetId: string): any {
	for (const cat of categories) {
		if (cat.id === targetId) {
			return cat;
		}
		if (cat.children && cat.children.length > 0) {
			const found = findCategoryInTree(cat.children, targetId);
			if (found) return found;
		}
	}
	return null;
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	console.log('🔵 Chargement catégorie ID:', params.category);
	
	// 1. Récupérer les threads
	const threadsRes = await apiFetch(fetch, `/forums/threads?category_id=${params.category}`);
	const threadsJson = await threadsRes.json();

	if (!threadsRes.ok) {
		console.error('❌ Erreur threads:', threadsJson);
		error(threadsRes.status, threadsJson.error ?? 'Erreur chargement threads');
	}

	// 2. Récupérer la liste des catégories depuis instance.ts
	const categoriesRes = await apiFetch(fetch, `/instance/categories`);
	const categoriesJson = await categoriesRes.json();
	
	// 3. Chercher notre catégorie RÉCURSIVEMENT dans l'arbre
	const category = findCategoryInTree(categoriesJson.categories || [], params.category);

	if (!category) {
		console.warn('⚠️ Catégorie non trouvée dans la liste, utilisation de l\'ID comme nom');
	}

	// 4. Retourner les données
	return { 
		threads: threadsJson.threads,
		categoryId: params.category,
		category: category || { 
			id: params.category, 
			name: 'Discussions',
			description: null
		}
	};
};