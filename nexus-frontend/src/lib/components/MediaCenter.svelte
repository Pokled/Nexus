<script lang="ts">
    let videoElem: HTMLVideoElement;
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let clipsBuffer: Blob[] = [];
    let bufferDuration = 0;

    // --- LOGIQUE DU CLIP ---

    function handleDataAvailable(event: BlobEvent) {
        if (event.data.size > 0) {
            clipsBuffer.push(event.data);
            bufferDuration += 5; 

            if (bufferDuration > 60) {
                clipsBuffer.shift(); 
                bufferDuration -= 5;
            }
        }
    }

    function saveClip() {
        if (clipsBuffer.length === 0) {
            alert("Rien n'a été enregistré pour le moment !");
            return;
        }

        const finalBlob = new Blob(clipsBuffer, { type: 'video/webm' });
        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `nexus-clip-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    // --- CAPTURE ---

    async function startScreenCapture() {
        try {
            // On définit les contraintes séparément pour pouvoir tricher sur le type
            const screenConstraints = {
                video: { 
                    displaySurface: "monitor",
                    cursor: "always" 
                } as any, // Le "as any" dit à TypeScript : "Laisse-moi passer, je sais ce que je fais"
                audio: true 
            };

            stream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
            
            if (videoElem) {
                videoElem.srcObject = stream;
            }

            // Démarrage du tampon pour le clip
            recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
            recorder.ondataavailable = handleDataAvailable;
            recorder.start(5000); 
            
        } catch (err) {
            console.error("Erreur capture écran:", err);
        }
    }

    function takeSnapshot() {
        if (!videoElem) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoElem.videoWidth;
        canvas.height = videoElem.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(videoElem, 0, 0);
        
        const link = document.createElement("a");
        link.download = `nexus-snap-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }
</script>

<div class="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-indigo-400">Nexus Media Hub</h2>
        <div class="flex gap-2">
            <button onclick={startScreenCapture} class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
                🖥️ Partager Écran / App
            </button>
        </div>
    </div>

    <div class="relative bg-black rounded-xl overflow-hidden border border-gray-700 aspect-video group shadow-inner">
        <video bind:this={videoElem} autoplay playsinline muted class="w-full h-full object-contain"></video>
        
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onclick={takeSnapshot} class="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 border border-white/10 transition-transform hover:scale-110" title="Capture instantanée">
                📸
            </button>
            <button onclick={saveClip} class="bg-red-500/20 backdrop-blur-md p-3 rounded-full hover:bg-red-500/40 border border-red-500/20 transition-transform hover:scale-110" title="Clipper la dernière minute">
                🎞️
            </button>
        </div>

        {#if !stream}
            <div class="absolute inset-0 flex items-center justify-center text-gray-600 text-sm italic">
                Aucune source sélectionnée
            </div>
        {/if}
    </div>

    <div class="space-y-2">
        <label for="stream-url" class="text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
            Stream externe (URL)
        </label>
        <div class="flex gap-2">
            <input 
                id="stream-url" 
                type="text" 
                placeholder="URL YouTube ou Twitch..." 
                class="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 outline-none text-gray-300 transition-colors" 
            />
            <button class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Charger</button>
        </div>
    </div>
</div>