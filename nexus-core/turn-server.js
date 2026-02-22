const Turn = require('node-turn');

const PUBLIC_IP = '87.88.104.61'; 
const USER      = 'guest';
const PASSWORD  = 'guest';

const server = new Turn({
  authMech:      'long-term',
  credentials:   { [USER]: PASSWORD },
  listeningPort: 3478,
  listeningIps:  ['0.0.0.0'],
  relayIps:      [PUBLIC_IP],
  externalIps:   { '0.0.0.0': PUBLIC_IP },
  realm:         'pokled.ddns.net',
  debugLevel:    'ALL', // <-- La virgule était manquante ici
  udp:           true,
  tcp:           true
});

server.start();
console.log(`[turn] RUNNING | IP: ${PUBLIC_IP} | Port: 3478 | AUTH: long-term`);