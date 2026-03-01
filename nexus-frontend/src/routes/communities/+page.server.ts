import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

// The global directory always lives on nexusnode.app.
// We never fetch from the local API here, because local instances
// don't replicate the directory — only nexusnode.app holds it.
const DIRECTORY_URL =
  (env.PUBLIC_DIRECTORY_URL ?? 'https://nexusnode.app') + '/api/directory';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch(DIRECTORY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { instances: data.instances ?? [] };
  } catch (err) {
    console.error('[communities] Failed to load directory:', err);
    return { instances: [] };
  }
};
