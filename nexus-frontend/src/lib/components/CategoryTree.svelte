<script module lang="ts">
	export interface CategoryNode {
		id: string;
		name: string;
		description: string | null;
		thread_count: number;
		parent_id: string | null;
		children: CategoryNode[];
	}
</script>

<script lang="ts">
	import Self from './CategoryTree.svelte'
	let { categories, depth = 0 }: { categories: CategoryNode[]; depth?: number } = $props();
</script>

{#each categories as cat}
	<div class="category-node" style="padding-left: {depth * 1.25}rem">
		<div class="flex items-start gap-3 group py-2.5 {depth > 0 ? 'border-l border-gray-800 pl-4 ml-1' : ''}">
			<!-- Indent indicator for sub-categories -->
			{#if depth > 0}
				<span class="mt-1 shrink-0 text-gray-700 select-none">└</span>
			{/if}

			<!-- Category icon -->
			<div class="mt-0.5 shrink-0 w-8 h-8 rounded-md flex items-center justify-center
			            {depth === 0 ? 'bg-indigo-900/60 text-indigo-400' : 'bg-gray-800 text-gray-500'}">
				{#if depth === 0}
					<!-- Folder icon -->
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						      d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
					</svg>
				{:else}
					<!-- Subfolder icon -->
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
					</svg>
				{/if}
			</div>

			<!-- Name + description -->
			<div class="flex-1 min-w-0">
				<a
					href="/forum/{cat.id}"
					class="text-sm font-semibold text-gray-100 hover:text-indigo-400 transition-colors leading-tight block"
				>
					{cat.name}
				</a>
				{#if cat.description && depth === 0}
					<p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
				{/if}
			</div>

			<!-- Thread count -->
			<div class="shrink-0 text-right">
				<span class="text-xs text-gray-600 tabular-nums">{cat.thread_count} fil{cat.thread_count !== 1 ? 's' : ''}</span>
			</div>
		</div>

		<!-- Recursive children -->
		{#if cat.children?.length}
			<Self categories={cat.children} depth={depth + 1} />
		{/if}
	</div>
{/each}
