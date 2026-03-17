import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: true,
		allowedHosts: true,
		hmr: {
			// Quand Caddy est en frontal (HTTPS port 443), le HMR WebSocket
			// doit se connecter sur le port 443 et non sur le port Vite (5173)
			clientPort: 443,
		},
		proxy: {
			// Toutes les requêtes /api/* et /socket.io/* passent par le backend local
			// → fonctionne depuis n'importe quelle IP (192.168.x.x, domaine DDNS, etc.)
			'/api': {
				target:      'http://127.0.0.1:3000',
				changeOrigin: true,
			},
			'/socket.io': {
				target:      'http://127.0.0.1:3000',
				changeOrigin: true,
				ws:           true, // WebSocket (Socket.IO)
			},
			'/uploads': {
				target:      'http://127.0.0.1:3000',
				changeOrigin: true,
			},
		},
	},
});
