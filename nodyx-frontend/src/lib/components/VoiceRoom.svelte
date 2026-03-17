<script lang="ts">
	import Table       from '$lib/components/Table.svelte';
	import NodyxCanvas from '$lib/components/NodyxCanvas.svelte';
	import VoiceJukebox from '$lib/components/VoiceJukebox.svelte';
	import { localScreenStore, remoteScreenStore, screenShareStore } from '$lib/voice';
	import { jukeboxStore } from '$lib/jukebox';
	import type { Socket } from 'socket.io-client';

	let {
		selectedChannel,
		voiceState,
		drawerOpen = $bindable(false),
		myUsername = '',
		myAvatar = null as string | null,
		token = null as string | null,
		socket = null as Socket | null,
		userId = '',
		canvasRecapChannelId = null as string | null,
		onjoinCurrentVoice,
	}: {
		selectedChannel: any;
		voiceState: any;
		drawerOpen?: boolean;
		myUsername: string;
		myAvatar: string | null;
		token: string | null;
		socket: Socket | null;
		userId: string;
		canvasRecapChannelId: string | null;
		onjoinCurrentVoice: () => Promise<void>;
	} = $props();

	// ── Screen share state ─────────────────────────────────────────────────
	const localScreen   = $derived($localScreenStore);
	const remoteScreens = $derived($remoteScreenStore);
	const anyScreenSharing = $derived($screenShareStore || $remoteScreenStore.size > 0);

	let showScreenShare = $state(false);
	$effect(() => { if (anyScreenSharing) showScreenShare = true; });

	// ── Jukebox state ──────────────────────────────────────────────────────
	const jbState = $derived($jukeboxStore);
	const jbToolbarLabel = $derived(
		jbState.track
			? (jbState.track.title.length > 28 ? jbState.track.title.slice(0, 28) + '…' : jbState.track.title)
			: 'Jukebox'
	);

	let showJukebox = $state(false);
	let showCanvas  = $state(false);

	// ── srcStream action ───────────────────────────────────────────────────
	function srcStream(node: HTMLVideoElement, stream: MediaStream | null) {
		node.srcObject = stream ?? null;
		return {
			update(s: MediaStream | null) { node.srcObject = s ?? null; },
			destroy() { node.srcObject = null; },
		};
	}
</script>

<!-- Channel header -->
<div class="h-12 shrink-0 border-b border-gray-800/60 bg-[#0e0c09]/80 flex items-center gap-2 px-4">
	<button class="lg:hidden -ml-1 mr-1 p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
	        onclick={() => drawerOpen = true} aria-label="Ouvrir les canaux" aria-expanded={drawerOpen} aria-controls="channels-drawer">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
		</svg>
	</button>
	<span class="text-xl">🔊</span>
	<span class="font-semibold text-gray-100">{selectedChannel.name}</span>
	{#if selectedChannel.description}
		<span class="text-gray-600 text-sm hidden sm:inline">— {selectedChannel.description}</span>
	{/if}
	{#if voiceState.active && voiceState.channelId === selectedChannel.id}
		<span class="ml-auto flex items-center gap-1.5 text-xs text-amber-600/80">
			<span class="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse shrink-0"></span>
			{voiceState.peers.length + 1} connecté{voiceState.peers.length > 0 ? 's' : ''}
		</span>
	{/if}
</div>

<!-- Voice toolbar -->
<div class="h-10 shrink-0 flex items-center gap-1 px-3" style="background:rgba(12,10,7,0.95); border-bottom:1px solid rgba(200,145,74,0.10);">
	<!-- Jukebox button -->
	<button
		onclick={() => showJukebox = !showJukebox}
		class="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all focus:outline-none"
		style="
			background:{showJukebox ? 'rgba(200,145,74,0.18)' : (jbState.track ? 'rgba(200,145,74,0.10)' : 'transparent')};
			color:{showJukebox || jbState.track ? '#c8914a' : '#6b6460'};
			border:1px solid {showJukebox ? 'rgba(200,145,74,0.35)' : (jbState.track ? 'rgba(200,145,74,0.20)' : 'rgba(200,145,74,0.08)')};"
	>
		{#if jbState.track && jbState.playing}
			<span class="relative flex w-2 h-2 shrink-0">
				<span class="absolute inline-flex h-full w-full rounded-full bg-amber-500/60 animate-ping"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
			</span>
		{:else}
			<span class="text-sm leading-none">♫</span>
		{/if}
		<span>{jbToolbarLabel}</span>
	</button>

	<div class="w-px h-5 mx-1" style="background:rgba(200,145,74,0.10);"></div>

	<!-- Table collaborative -->
	<button
		onclick={() => showCanvas = !showCanvas}
		class="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all focus:outline-none"
		style="
			background:{showCanvas ? 'rgba(168,85,247,0.18)' : 'transparent'};
			color:{showCanvas ? '#c084fc' : '#6b6460'};
			border:1px solid {showCanvas ? 'rgba(168,85,247,0.35)' : 'rgba(168,85,247,0.08)'};"
		title="Table collaborative P2P"
	>
		{#if showCanvas}
			<span class="relative flex w-2 h-2 shrink-0">
				<span class="absolute inline-flex h-full w-full rounded-full bg-violet-400/60 animate-ping"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
			</span>
		{:else}
			<span class="text-sm leading-none">🎨</span>
		{/if}
		<span>Tableau</span>
	</button>

	<div class="w-px h-5 mx-1" style="background:rgba(200,145,74,0.10);"></div>

	<!-- Video share -->
	<button
		onclick={() => showScreenShare = !showScreenShare}
		title={anyScreenSharing ? "Afficher/masquer le partage d'écran" : "Partage d'écran (actif quand quelqu'un partage)"}
		class="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all focus:outline-none {anyScreenSharing ? '' : 'opacity-40'}"
		style="
			background:{showScreenShare && anyScreenSharing ? 'rgba(59,130,246,0.18)' : 'transparent'};
			color:{anyScreenSharing ? '#60a5fa' : '#6b6460'};
			border:1px solid {showScreenShare && anyScreenSharing ? 'rgba(59,130,246,0.35)' : (anyScreenSharing ? 'rgba(59,130,246,0.20)' : 'rgba(200,145,74,0.08)')};"
	>
		{#if anyScreenSharing}
			<span class="relative flex w-2 h-2 shrink-0">
				<span class="absolute inline-flex h-full w-full rounded-full bg-blue-400/60 animate-ping"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
			</span>
		{:else}
			<span class="text-sm leading-none">📺</span>
		{/if}
		Vidéo
	</button>

	<!-- File share (stub) -->
	<button disabled title="Partage de fichiers (bientôt)"
		class="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs transition-all focus:outline-none opacity-30 cursor-not-allowed"
		style="color:#6b6460; border:1px solid rgba(200,145,74,0.08);">📁 Fichiers</button>

	<!-- Games (stub) -->
	<button disabled title="Jeux (bientôt)"
		class="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs transition-all focus:outline-none opacity-30 cursor-not-allowed"
		style="color:#6b6460; border:1px solid rgba(200,145,74,0.08);">🎮 Jeux</button>
</div>

<!-- Jukebox panel (expandable) -->
{#if showJukebox}
	<VoiceJukebox
		joined={voiceState.active && voiceState.channelId === selectedChannel.id}
		me={{ username: myUsername }}
	/>
{/if}

<!-- Screen share panel -->
{#if showScreenShare && (localScreen || remoteScreens.size > 0)}
	<div class="shrink-0 bg-black border-b border-gray-800/60 flex items-center justify-center gap-3 p-3" style="max-height:40vh; overflow:auto;">
		{#if localScreen}
			<div class="relative flex-shrink-0 h-44 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
				<video class="h-full object-contain" autoplay muted playsinline use:srcStream={localScreen}></video>
				<span class="absolute bottom-1 left-2 text-xs text-white bg-black/70 px-1.5 py-0.5 rounded">Vous</span>
			</div>
		{/if}
		{#each [...remoteScreens.entries()] as [socketId, stream] (socketId)}
			{@const peer = voiceState.peers.find((p: any) => p.socketId === socketId)}
			<div class="relative flex-shrink-0 h-44 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
				<video class="h-full object-contain" autoplay playsinline use:srcStream={stream}></video>
				<span class="absolute bottom-1 left-2 text-xs text-white bg-black/70 px-1.5 py-0.5 rounded">{peer?.username ?? 'Peer'}</span>
			</div>
		{/each}
	</div>
{/if}

<!-- Table (takes remaining space) -->
<div class="flex-1 overflow-hidden bg-[#0d0b08] flex items-center justify-center">
	<Table
		channelName={selectedChannel.name}
		channelId={selectedChannel.id}
		me={{ username: myUsername, avatar: myAvatar }}
		{token}
		joined={voiceState.active && voiceState.channelId === selectedChannel.id}
		onjoin={onjoinCurrentVoice}
		socket={socket}
	/>
</div>

<!-- NodyxCanvas overlay -->
{#if showCanvas}
	<NodyxCanvas
		channelId={canvasRecapChannelId}
		voiceChannelId={voiceState.channelId}
		socket={socket}
		{userId}
		username={myUsername}
		onclose={() => showCanvas = false}
	/>
{/if}
