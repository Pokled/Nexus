export async function checkOllamaStatus() {
    try {
        // On utilise maintenant le proxy sécurisé par Caddy
        const response = await fetch('/ollama/api/tags');
        
        if (!response.ok) return { active: false, models: [] };

        const data = await response.json();
        return {
            active: true,
            models: data.models || [],
            version: response.headers.get('x-ollama-version') || 'Stable'
        };
    } catch (e) {
        return { active: false, models: [] };
    }
}