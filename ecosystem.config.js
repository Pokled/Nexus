module.exports = {
  apps: [
    {
      name: 'nexus-core',
      script: 'dist/index.js',
      cwd: 'H:/Projets/Nexus/nexus-core',
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'nexus-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: 'dev --host',
      cwd: 'H:/Projets/Nexus/nexus-frontend',
      watch: false,
      interpreter: 'node',
      env: { NODE_ENV: 'development' },
    },
    {
      name: 'caddy',
      script: 'C:/caddy/caddy.exe',
      args: 'run --config H:/Projets/Nexus/Caddyfile.dev --adapter caddyfile',
      cwd: 'H:/Projets/Nexus',
      watch: false,
      interpreter: 'none',
    },
    {
      name: 'nexus-turn',
      script: 'server.js',
      cwd: 'H:/Projets/Nexus/turn-server',
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'ollama-service',
      script: 'C:/Users/Administrateur/ollama-runner.js',
      cwd: 'C:/Users/Administrateur',
      watch: false,
    }
  ],
}