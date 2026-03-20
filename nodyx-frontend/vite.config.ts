import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// TipTap (éditeur WYSIWYG) — ~500KB, chargé uniquement sur les pages forum/chat
					if (id.includes('@tiptap')) return 'vendor-tiptap'
					// Socket.IO client — chargé dynamiquement, mais on isole le vendor
					if (id.includes('socket.io-client') || id.includes('engine.io-client')) return 'vendor-socket'
					// Lowlight (syntax highlighting code blocks) — rarement utilisé
					if (id.includes('lowlight') || id.includes('highlight.js')) return 'vendor-highlight'
					// QRCode — utilisé uniquement dans settings (Nodyx Signet)
					if (id.includes('qrcode')) return 'vendor-misc'
					// RNNoise WASM (débruitage voix) — très lourd, isolé
					if (id.includes('rnnoise') || id.includes('@jitsi')) return 'vendor-audio'
				},
			},
		},
	},

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
