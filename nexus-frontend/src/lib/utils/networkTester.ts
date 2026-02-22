import { 
    PUBLIC_TURN_URL, 
    PUBLIC_TURN_USERNAME, 
    PUBLIC_TURN_CREDENTIAL 
} from '$env/static/public';

/**
 * Nexus Network Diagnostic Engine
 * Analyse la connectivité WebRTC (UDP, STUN, TURN)
 */
export async function runNetworkDiagnostic(onUpdate: (results: any) => void) {
    
    // Définition explicite du type pour satisfaire TypeScript
    const iceServers: RTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' }
    ];

    // On ajoute ton serveur TURN seulement si l'URL est définie
    if (PUBLIC_TURN_URL) {
        iceServers.push({
            urls: PUBLIC_TURN_URL,
            username: PUBLIC_TURN_USERNAME,
            credential: PUBLIC_TURN_CREDENTIAL
        });
    }

    const pc = new RTCPeerConnection({ iceServers });

    let results = {
        udp: false,
        p2p: false,
        relay: false,
        candidates: [] as string[],
        status: 'testing',
        error: null as string | null
    };

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            const c = event.candidate.candidate;
            results.candidates.push(c);
            results.udp = true;

            if (c.includes('typ srflx')) results.p2p = true;
            if (c.includes('typ relay')) results.relay = true;
            
            onUpdate({ ...results });
        } else {
            results.status = 'finished';
            onUpdate({ ...results });
            pc.close();
        }
    };

    pc.onicecandidateerror = (event: any) => {
        // Correction : on utilise event.url pour détecter si c'est le TURN
        if (event.url && event.url.includes('turn')) {
            results.error = "Le serveur TURN ne répond pas.";
            onUpdate({ ...results });
        }
    };

    try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true });
        await pc.setLocalDescription(offer);
    } catch (e: any) {
        results.status = 'error';
        results.error = e.message;
        onUpdate({ ...results });
    }

    setTimeout(() => {
        if (results.candidates.length === 0 && results.status === 'testing') {
            results.status = 'blocked';
            results.error = "UDP bloqué (Pare-feu agressif)";
            onUpdate({ ...results });
            pc.close();
        }
    }, 7000);
}