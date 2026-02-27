<script lang='ts'>
    import {
        voiceStore, leaveVoice, toggleMute, toggleDeafen, togglePTTMode,
        startPTT, stopPTT, inputLevel, setPeerVolume,
        peerStatsStore, getQuality,
        type VoicePeer, type PeerStats, type NetQuality,
    } from '$lib/voice'

    import MediaCenter from './MediaCenter.svelte';
    let showMediaHub = $state(false);

    const vs       = $derived($voiceStore)
    const peers    = $derived(vs.peers)
    const muted    = $derived(vs.muted)
    const deafened = $derived(vs.deafened)
    const pttMode  = $derived(vs.pttMode)
    const level    = $derived($inputLevel)
    const statsMap = $derived($peerStatsStore)

    const levelColor = $derived(
        level > 70 ? 'bg-red-500' :
        level > 35 ? 'bg-yellow-400' :
        level > 8  ? 'bg-green-500' :
        'bg-gray-600'
    )

    // ── Popup état ────────────────────────────────────────────────
    let selectedPeer: VoicePeer | null = $state(null)
    let peerVolumes: Record<string, number> = $state({})

    function openPeerPanel(peer: VoicePeer) {
        selectedPeer = selectedPeer?.socketId === peer.socketId ? null : peer
        if (!(peer.socketId in peerVolumes)) peerVolumes[peer.socketId] = 100
    }

    function closePanel() { selectedPeer = null }

    function onVolumeChange(socketId: string, v: number) {
        peerVolumes[socketId] = v
        setPeerVolume(socketId, v / 100)
    }

    // ── Qualité réseau ────────────────────────────────────────────

    const QUALITY_LABELS: Record<NetQuality, string> = {
        excellent: 'Excellent',
        good:      'Bon',
        fair:      'Moyen',
        poor:      'Mauvais',
        unknown:   'Inconnu',
    }

    function qualityBars(q: NetQuality): number {
        return { excellent: 4, good: 3, fair: 2, poor: 1, unknown: 0 }[q]
    }

    function fmtRtt(v: number | null): string   { return v === null ? '—' : `${v} ms` }
    function fmtLoss(v: number | null): string  { return v === null ? '—' : `${v} %` }
    function fmtJitter(v: number | null): string { return v === null ? '—' : `${v} ms` }

    // Inline dot color — safe for Tailwind v4 scanner
    function qualityDotClass(q: NetQuality): string {
        if (q === 'excellent') return 'bg-green-400'
        if (q === 'good')      return 'bg-lime-400'
        if (q === 'fair')      return 'bg-yellow-400'
        if (q === 'poor')      return 'bg-red-500'
        return 'bg-gray-500'
    }
    function qualityBarClass(q: NetQuality, active: boolean): string {
        if (!active) return 'bg-gray-700'
        if (q === 'excellent') return 'bg-green-400'
        if (q === 'good')      return 'bg-lime-400'
        if (q === 'fair')      return 'bg-yellow-400'
        if (q === 'poor')      return 'bg-red-500'
        return 'bg-gray-600'
    }
    function qualityTextClass(q: NetQuality): string {
        if (q === 'poor')    return 'text-red-400'
        if (q === 'fair')    return 'text-yellow-400'
        if (q === 'unknown') return 'text-gray-500'
        return 'text-green-400'
    }
</script>

{#if vs.active}
    {#if selectedPeer !== null}
        {@const selPeer = selectedPeer}
        {@const stats   = statsMap.get(selPeer.socketId)}
        {@const quality = getQuality(stats)}
        {@const bars    = qualityBars(quality)}
        {@const vol     = peerVolumes[selPeer.socketId] ?? 100}

        <div
            class='fixed inset-0 z-40'
            role='button' tabindex='-1'
            onclick={closePanel}
            onkeydown={e => e.key === 'Escape' && closePanel()}
            aria-label='Fermer le panneau'
        ></div>

        <div class='fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-72 rounded-2xl bg-gray-900 border border-gray-700/80 shadow-2xl overflow-hidden'>

            <div class='flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-800'>
                {#if selPeer.avatar}
                    <img src={selPeer.avatar} alt={selPeer.username}
                        class='w-11 h-11 rounded-full object-cover ring-2 {qualityDotClass(quality)}'/>
                {:else}
                    <div class='w-11 h-11 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white ring-2 {qualityDotClass(quality)}'>
                        {selPeer.username.charAt(0).toUpperCase()}
                    </div>
                {/if}
                <div class='flex-1 min-w-0'>
                    <p class='text-sm font-semibold text-white truncate'>{selPeer.username}</p>
                    <div class='flex items-center gap-1.5 mt-0.5'>
                        <div class='flex items-end gap-0.5 h-3'>
                            {#each [1,2,3,4] as bar}
                                <div class='w-1 rounded-sm transition-colors {qualityBarClass(quality, bar <= bars)}'
                                    style='height: {bar * 25}%'></div>
                            {/each}
                        </div>
                        <span class='text-xs {qualityTextClass(quality)}'>
                            {QUALITY_LABELS[quality]}
                        </span>
                    </div>
                </div>
                <button
                    onclick={closePanel}
                    aria-label='Fermer'
                    class='text-gray-500 hover:text-gray-300 transition-colors p-1'
                >
                    <svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'>
                        <path stroke-linecap='round' stroke-linejoin='round' d='M6 18L18 6M6 6l12 12'/>
                    </svg>
                </button>
            </div>

            <div class='px-4 py-3 space-y-1.5 border-b border-gray-800'>
                <p class='text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2'>Réseau</p>

                <div class='grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs'>
                    <div class='flex justify-between'>
                        <span class='text-gray-400'>Votre ping</span>
                        <span class='font-mono text-white'>{fmtRtt(stats?.rtt ?? null)}</span>
                    </div>
                    <div class='flex justify-between'>
                        <span class='text-gray-400'>Leur ping</span>
                        <span class='font-mono text-white'>{fmtRtt(stats?.theirRtt ?? null)}</span>
                    </div>
                    <div class='flex justify-between'>
                        <span class='text-gray-400'>Perte paquets</span>
                        <span class='font-mono {(stats?.packetLoss ?? 0) > 5 ? "text-red-400" : "text-white"}'>{fmtLoss(stats?.packetLoss ?? null)}</span>
                    </div>
                    <div class='flex justify-between'>
                        <span class='text-gray-400'>Gigue</span>
                        <span class='font-mono {(stats?.jitter ?? 0) > 30 ? "text-yellow-400" : "text-white"}'>{fmtJitter(stats?.jitter ?? null)}</span>
                    </div>
                </div>

                <div class='flex items-center justify-between pt-0.5'>
                    <span class='text-xs text-gray-400'>Connexion</span>
                    {#if stats?.connectionType === 'relay'}
                        <span class='text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-medium'>Relay TURN</span>
                    {:else if stats?.connectionType === 'direct'}
                        <span class='text-[10px] px-1.5 py-0.5 rounded bg-green-900/60 text-green-300 font-medium'>Direct P2P</span>
                    {:else}
                        <span class='text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-medium'>Inconnu</span>
                    {/if}
                </div>
            </div>

            <div class='px-4 py-3 border-b border-gray-800'>
                <div class='flex items-center justify-between mb-1.5'>
                    <span class='text-xs text-gray-400'>Volume local</span>
                    <span class='text-xs font-mono text-white'>{vol}%</span>
                </div>
                <input
                    type='range' min='0' max='150' step='5'
                    value={vol}
                    oninput={e => onVolumeChange(selPeer.socketId, Number((e.target as HTMLInputElement).value))}
                    class='w-full h-1.5 appearance-none rounded-full bg-gray-700 accent-indigo-500 cursor-pointer'
                />
            </div>

            <div class='px-3 py-2.5 flex gap-2'>
                <a
                    href='/users/{selPeer.username}'
                    onclick={closePanel}
                    class='flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors'
                >
                    <svg xmlns='http://www.w3.org/2000/svg' class='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'>
                        <path stroke-linecap='round' stroke-linejoin='round' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/>
                    </svg>
                    Profil
                </a>
                <a
                    href='/chat?dm={selPeer.username}'
                    onclick={closePanel}
                    class='flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-medium transition-colors'
                >
                    <svg xmlns='http://www.w3.org/2000/svg' class='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'>
                        <path stroke-linecap='round' stroke-linejoin='round' d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'/>
                    </svg>
                    Message
                </a>
            </div>
        </div>
    {/if}

    <div class='fixed bottom-0 left-0 lg:left-[220px] right-0 z-40 pointer-events-none'>
        <div class='mx-auto max-w-4xl px-4 pb-2 pointer-events-auto'>
            <div class='flex items-center gap-3 rounded-xl bg-gray-900/95 border border-gray-700/80 shadow-2xl backdrop-blur-sm px-4 py-2.5'>

                <div class='flex items-center gap-2 min-w-0 flex-1'>
                    <span class='w-2 h-2 rounded-full shrink-0 {level > 8 && !muted ? "bg-green-400 animate-pulse" : "bg-gray-600"}'></span>
                    <span class='text-xs text-green-300 font-medium truncate'>
                        Vocal · {peers.length + 1} participant{peers.length > 0 ? 's' : ''}
                    </span>
                    <div class='w-12 h-1 bg-gray-800 rounded-full overflow-hidden shrink-0'>
                        <div class='h-full rounded-full transition-all duration-75 {levelColor}' style='width: {level}%'></div>
                    </div>
                </div>

                <div class='flex items-center -space-x-1.5'>
                    {#each peers.slice(0, 6) as peer (peer.socketId)}
                        {@const pStats   = statsMap.get(peer.socketId)}
                        {@const pQuality = getQuality(pStats)}
                        <button
                            onclick={() => openPeerPanel(peer)}
                            class='relative z-10 focus:outline-none hover:z-20'
                            title='{peer.username} — cliquer pour les détails'
                        >
                            {#if peer.avatar}
                                <img
                                    src={peer.avatar}
                                    alt={peer.username}
                                    class='w-7 h-7 rounded-full object-cover border-2 border-gray-900 transition-transform hover:scale-110 ring-2 
                                        {peer.speaking 
                                            ? "ring-green-400 ring-offset-1 ring-offset-gray-800 speaking-active small-avatar" 
                                            : "ring-gray-700"}'
                                />
                            {:else}
                                <div class='w-7 h-7 rounded-full bg-indigo-700 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:scale-110 ring-2 
                                            {peer.speaking 
                                                ? "ring-green-400 ring-offset-1 ring-offset-gray-800 speaking-active small-avatar" 
                                                : "ring-gray-700"}'>
                                    {peer.username.charAt(0).toUpperCase()}
                                </div>
                            {/if}
                            <span class='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-gray-900 {qualityDotClass(pQuality)}'></span>
                        </button>
                    {/each}
                    {#if peers.length > 6}
                        <div class='relative z-10 w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-[10px] text-gray-400 font-medium'>
                            +{peers.length - 6}
                        </div>
                    {/if}
                </div>

                <div class='flex items-center gap-1 shrink-0'>

                    <div class="relative">
                        <button 
                            onclick={() => showMediaHub = !showMediaHub}
                            class="p-2 rounded-lg transition-colors {showMediaHub ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'}"
                            title="Partage d'écran & Capture"
                        >
                            <span class="text-sm">🖥️</span>
                        </button>

                        {#if showMediaHub}
                            <div class="absolute bottom-full mb-4 right-0 w-[400px] z-[100] animate-in fade-in slide-in-from-bottom-4">
                                <div class="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                                    <MediaCenter />
                                    <button 
                                        onclick={() => showMediaHub = false}
                                        class="absolute top-4 right-4 text-gray-500 hover:text-white bg-black/40 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm"
                                    >✕</button>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <button
                        onclick={toggleMute}
                        class="p-2 rounded-lg transition-colors {muted ? 'bg-red-900/60 text-red-300 hover:bg-red-900/80' : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'}"
                        title={muted ? 'Réactiver le micro' : 'Couper le micro'}
                    >
                        {#if muted}
                            <svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'>
                                <line x1='1' y1='1' x2='23' y2='23'/>
                                <path d='M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6'/>
                                <path d='M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23'/>
                                <line x1='12' y1='19' x2='12' y2='23'/><line x1='8' y1='23' x2='16' y2='23'/>
                            </svg>
                        {:else}
                            <svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'>
                                <path d='M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z'/>
                                <path d='M19 10v2a7 7 0 0 1-14 0v-2'/>
                                <line x1='12' y1='19' x2='12' y2='23'/><line x1='8' y1='23' x2='16' y2='23'/>
                            </svg>
                        {/if}
                    </button>

                    <button
                        onclick={toggleDeafen}
                        class="p-2 rounded-lg transition-colors {deafened ? 'bg-red-900/60 text-red-300 hover:bg-red-900/80' : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'}"
                        title={deafened ? 'Réactiver le son' : 'Se rendre sourd'}
                    >
                        <svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'>
                            <path d='M3 18v-6a9 9 0 0 1 18 0v6'/>
                            <path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'/>
                        </svg>
                    </button>

                    <button
                        onclick={togglePTTMode}
                        class="p-2 rounded-lg transition-colors {pttMode ? 'bg-orange-900/60 text-orange-300' : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'}"
                        title='Push-to-Talk (Alt pour parler)'
                    >
                        <svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'>
                            <path stroke-linecap='round' stroke-linejoin='round' d='M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 0 1 6 0v6a3 3 0 0 1-3 3z'/>
                        </svg>
                    </button>

                    {#if pttMode}
                        <button
                            onmousedown={startPTT} onmouseup={stopPTT} onmouseleave={stopPTT}
                            class='px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-orange-700 active:bg-orange-600 text-gray-300 active:text-white text-xs font-medium transition-colors select-none'
                            title='Maintenir pour parler (ou Alt au clavier)'
                        >PARLER</button>
                    {/if}

                    <div class='w-px h-5 bg-gray-700 mx-1'></div>

                    <button
                        onclick={leaveVoice}
                        class='px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5'
                        title='Quitter le salon vocal'
                    >
                        <svg xmlns='http://www.w3.org/2000/svg' class='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2.5'>
                            <path stroke-linecap='round' stroke-linejoin='round' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1'/>
                        </svg>
                        Quitter
                    </button>
                </div>

            </div>
        </div>
    </div>
{/if}
<style>
/* ==============================================
   ANIMATION VOCALE – HALO NEXUS (VERSION UNIFIÉE)
   Tous les avatars, petits et grands, ont le même effet
   ============================================== */

/* Classe de base pour tous les avatars qui parlent */
.speaking-active {
    position: relative;
    z-index: 10;
    /* Ombre subtile qui suit l'avatar */
    filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.8));
    transition: filter 0.2s ease;
    /* L'avatar respire légèrement */
    animation: avatar-breathe 1.5s ease-in-out infinite;
}

/* Le HALO UNIFIÉ – exactement le même pour tous */
.speaking-active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 280%;                    /* Même taille pour tous */
    height: 280%;
    border-radius: 50%;
    
    /* Dégradé violet/vert signature Nexus */
    background: radial-gradient(circle at 30% 30%,
        rgba(168, 85, 247, 0.95) 0%,    /* Violet vif */
        rgba(139, 92, 246, 0.8) 25%,    /* Violet moyen */
        rgba(74, 222, 128, 0.7) 50%,    /* Vert Nexus */
        rgba(74, 222, 128, 0.3) 75%,
        transparent 90%
    );
    
    animation: nexus-pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    pointer-events: none;
    z-index: -1;
    
    /* Effets de lumière */
    filter: blur(4px) brightness(1.3);
    mix-blend-mode: screen;
    opacity: 0.9;
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}

/* Animation principale – dynamique et fluide */
@keyframes nexus-pulse {
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.6);
        filter: blur(3px) brightness(1.5);
    }
    30% {
        opacity: 0.9;
        transform: translate(-50%, -50%) scale(1.1);
        filter: blur(4px) brightness(1.3);
    }
    60% {
        opacity: 0.7;
        transform: translate(-50%, -50%) scale(1.6);
        filter: blur(5px) brightness(1.1);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(2.4);
        filter: blur(6px) brightness(0.9);
    }
}

/* Respiration de l'avatar */
@keyframes avatar-breathe {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

/* Adaptation pour les très petits avatars (optionnel, si besoin) */
.speaking-active.small-avatar::after {
    /* On garde exactement les mêmes propriétés */
    /* Pas de changement, le halo est déjà proportionnel */
}

/* Version MUTE – quand l'utilisateur est en sourdine */
.speaking-active.muted::after {
    background: radial-gradient(circle at 30% 30%,
        rgba(239, 68, 68, 0.9) 0%,     /* Rouge vif */
        rgba(239, 68, 68, 0.6) 40%,
        transparent 80%
    );
    filter: blur(4px) brightness(1);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

/* Version DEAFEN – sourdine + sourd */
.speaking-active.deafened::after {
    background: radial-gradient(circle at 30% 30%,
        rgba(107, 114, 128, 0.8) 0%,   /* Gris */
        rgba(75, 85, 99, 0.5) 50%,
        transparent 80%
    );
    filter: blur(4px) brightness(0.7);
    box-shadow: 0 0 20px rgba(107, 114, 128, 0.5);
    animation: none;  /* Pas d'animation quand on est sourd */
    opacity: 0.4;
}

/* Pour les avatars sans image (lettres) */
.speaking-active div, 
.speaking-active .bg-indigo-700 {
    /* Assure que le halo fonctionne même sur les div */
    position: relative;
    z-index: 10;
}

/* ── On garde tes classes existantes par compatibilité ── */
.speaking-active.normal,
.speaking-active.test-visible {
    /* Conservé pour d'éventuels usages */
}

/* On supprime les anciennes animations pour éviter les conflits */
/* Déclarations vides pour remplacer les anciennes animations */
@keyframes sound-wave-test {}
@keyframes sound-wave {}
@keyframes sound-wave-small {}
</style>
