/**
 * PM2 ecosystem config — copy to ecosystem.config.js and adapt paths
 */
module.exports = {
  apps: [
    {
      name: 'nexus-core',
      script: 'dist/index.js',
      cwd: './nexus-core',
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'nexus-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --host',
      cwd: './nexus-frontend',
      watch: false,
      interpreter: 'node',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'caddy',
      script: '/usr/bin/caddy',           // Linux: /usr/bin/caddy | Windows: C:/caddy/caddy.exe
      args: 'run --config ./Caddyfile.example --adapter caddyfile',
      cwd: './',
      watch: false,
      interpreter: 'none',
    },
    {
      name: 'nexus-turn',
      script: 'server.js',
      cwd: './turn-server',
      watch: false,
      env: { NODE_ENV: 'production' },
    },
  ],
}
