/**
 * Nexus TURN Server — node-turn
 * Version PROD avec Auth pour valider le Relay
 */
const TurnServer = require('node-turn')

const EXTERNAL_IP = process.env.TURN_EXTERNAL_IP || '87.88.104.61'
const PORT = parseInt(process.env.TURN_PORT || '3478', 10)
const USER = process.env.TURN_USER || 'guest'
const PASSWORD = process.env.TURN_PASSWORD || 'guest'

const server = new TurnServer({
  authMech: 'long-term',
  credentials: { guest: "guest" },
  listeningPort: 3478,
  listeningIps: ['0.0.0.0'], // On écoute sur toutes les interfaces locales

  // --- LE FIX EST ICI ---
  // relayIps DOIT être l'IP locale de ta machine (celle en 192.168.x.x)
  relayIps: ['192.168.1.100'], // <--- REMPLACE PAR TON IP LOCALE RÉELLE

  // externalIp est l'IP que le serveur "annonce" au monde
  externalIp: '87.88.104.61',

  // On réduit la plage pour éviter de stresser le pare-feu Windows
  minPort: 49152,
  maxPort: 55440,
  // ----------------------

  realm: 'pokled.ddns.net',
  debugLevel: 'ALL',
});

server.start()
console.log(`[turn] Listening UDP ${PORT} | relay=${EXTERNAL_IP} | auth=long-term`)
console.log(`[turn] Credentials: ${USER} / ${PASSWORD}`)
