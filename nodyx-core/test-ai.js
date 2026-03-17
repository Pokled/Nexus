import { getActiveModel } from './ai-config.js'; // Importation

async function testSavoirVivre(message) {
    const currentModel = getActiveModel(); // On récupère le modèle choisi dans l'admin
    console.log(`\n[Neural Engine] Utilisation du modèle : ${currentModel}`);
    
    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: currentModel, // <-- C'est dynamique maintenant !
                prompt: `Analyse la toxicité...`,
                stream: false
            })
        });
    } catch (error) {
        console.error("[Erreur] L'IA ne répond pas. Vérifie qu'Ollama tourne !");
    }
}

// Lancement des tests
testSavoirVivre("Salut l'équipe, j'adore ce que vous faites !");
testSavoirVivre("Espèce d'incapable, ton serveur est nul !");