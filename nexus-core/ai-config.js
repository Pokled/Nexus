import fs from 'fs';
import path from 'path';

const CONFIG_FILE = './neural-config.json';

export function getActiveModel() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data).activeModel || 'llama3.2';
        }
    } catch (e) {
        console.error("Erreur lecture config IA:", e);
    }
    return 'llama3.2'; // Modèle par défaut
}