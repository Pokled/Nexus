<script lang="ts">
    import { onDestroy } from 'svelte'
    import {
        startScreenShare,
        stopScreenShare,
        screenShareStore,
        localScreenStore,
        remoteScreenStore,
        voiceStore,
    } from '$lib/voice'

    // ── Derived state ──────────────────────────────────────────────
    const isSharing     = $derived($screenShareStore)
    const localStream   = $derived($localScreenStore)
    const remoteScreens = $derived($remoteScreenStore)
    const peers         = $derived($voiceStore.peers)

    // ── Local video element ────────────────────────────────────────
    let localVideoElem: HTMLVideoElement | undefined = $state(undefined)

    $effect(() => {
        if (localVideoElem) {
            localVideoElem.srcObject = localStream ?? null
        }
    })

    // ── Clip buffer (rolling 60s) ──────────────────────────────────
    let recorder:    MediaRecorder | null = null
    let clipsBuffer: Blob[]               = []
    let bufferSecs   = 0

    $effect(() => {
        if (localStream) {
            _startRecording(localStream)
        } else {
            _stopRecording()
        }
    })

    function _startRecording(stream: MediaStream) {
        _stopRecording()
        try {
            recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' })
            recorder.ondataavailable = (e: BlobEvent) => {
                if (e.data.size === 0) return
                clipsBuffer.push(e.data)
                bufferSecs += 5
                if (bufferSecs > 60) { clipsBuffer.shift(); bufferSecs -= 5 }
            }
            recorder.start(5000)
        } catch { /* codec not supported */ }
    }

    function _stopRecording() {
        if (recorder?.state !== 'inactive') recorder?.stop()
        recorder    = null
        clipsBuffer = []
        bufferSecs  = 0
    }

    onDestroy(_stopRecording)

    // ── Actions ───────────────────────────────────────────────────

    function saveClip() {
        if (clipsBuffer.length === 0) return
        const blob = new Blob(clipsBuffer, { type: 'video/webm' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `nexus-clip-${Date.now()}.webm`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
    }

    function takeSnapshot() {
        if (!localVideoElem || !localStream) return
        const canvas  = document.createElement('canvas')
        canvas.width  = localVideoElem.videoWidth
        canvas.height = localVideoElem.videoHeight
        canvas.getContext('2d')?.drawImage(localVideoElem, 0, 0)
        const a    = document.createElement('a')
        a.download = `nexus-snap-${Date.now()}.png`
        a.href     = canvas.toDataURL('image/png')
        a.click()
    }

    // ── Svelte action: bind MediaStream to <video> srcObject ───────
    function streamSrc(node: HTMLVideoElement, stream: MediaStream) {
        node.srcObject = stream
        return {
            update(s: MediaStream) { node.srcObject = s },
            destroy()              { node.srcObject = null },
        }
    }
</script>

<div class="p-4 space-y-4">

    <!-- ── Header ──────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            Media Hub
        </h3>

        {#if !isSharing}
            <button
                onclick={startScreenShare}
                class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
            >
                🖥️ Partager
            </button>
        {:else}
            <button
                onclick={stopScreenShare}
                class="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 animate-pulse"
            >
                ⏹ Arrêter
            </button>
        {/if}
    </div>

    <!-- ── Local screen preview ─────────────────────────────────── -->
    <div class="relative bg-black rounded-xl overflow-hidden border border-gray-700 aspect-video group">
        <video
            bind:this={localVideoElem}
            autoplay playsinline muted
            class="w-full h-full object-contain"
        ></video>

        {#if localStream}
            <!-- Controls on hover -->
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onclick={takeSnapshot}
                    class="bg-white/10 backdrop-blur-md p-2.5 rounded-full hover:bg-white/20 border border-white/10 transition-transform hover:scale-110"
                    title="Capture instantanée"
                >📸</button>
                <button
                    onclick={saveClip}
                    class="bg-red-500/20 backdrop-blur-md p-2.5 rounded-full hover:bg-red-500/40 border border-red-500/20 transition-transform hover:scale-110"
                    title="Sauvegarder le dernier clip (60s)"
                >🎞️</button>
            </div>
            <!-- Recording indicator -->
            <div class="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span class="text-[10px] text-red-400 font-bold">EN DIRECT</span>
            </div>
        {:else}
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-600">
                <span class="text-4xl opacity-50">🖥️</span>
                <p class="text-xs text-center px-4">
                    Cliquez sur <strong class="text-gray-400">Partager</strong> pour diffuser votre écran aux participants
                </p>
            </div>
        {/if}
    </div>

    <!-- ── Remote screens ──────────────────────────────────────── -->
    {#if remoteScreens.size > 0}
        <div class="space-y-2">
            <p class="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Partages actifs — {remoteScreens.size}
            </p>
            <div class="space-y-2">
                {#each [...remoteScreens.entries()] as [socketId, stream] (socketId)}
                    {@const peer = peers.find(p => p.socketId === socketId)}
                    <div class="space-y-1">
                        <p class="text-xs text-gray-400 flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            {peer?.username ?? 'Participant'} partage son écran
                        </p>
                        <div class="relative bg-black rounded-lg overflow-hidden border border-gray-700 aspect-video">
                            <video
                                use:streamSrc={stream}
                                autoplay playsinline muted
                                class="w-full h-full object-contain"
                            ></video>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

</div>
