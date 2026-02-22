<script>
    import NetworkDoctor from '$lib/components/NetworkDoctor.svelte';
</script>

<div class="min-h-screen bg-[#050505] text-white p-8">
    <div class="max-w-2xl mx-auto space-y-12">
        <header>
            <h1 class="text-5xl font-black italic uppercase tracking-tighter mb-2">Settings</h1>
            <div class="h-1 w-20 bg-indigo-600"></div>
        </header>

        <section>
            <h2 class="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Infrastructure & Réseau</h2>
            
            <NetworkDoctor />
        </section>

        <section class="opacity-30 pointer-events-none">
            <h2 class="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Autres réglages (Bientôt)</h2>
            <div class="p-4 border border-white/5 rounded-xl">Profil, Notifications, Apparence...</div>
        </section>
    </div>
</div>