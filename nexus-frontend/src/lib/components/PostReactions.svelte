<script lang="ts">
	import { enhance } from '$app/forms';

	interface ReactionSummary {
		emoji: string;
		count: number;
		user_reacted: boolean;
	}

	let {
		postId,
		reactions     = [],
		thanksCount   = 0,
		userThanked   = false,
		isOwnPost     = false,
		isLoggedIn    = false,
	}: {
		postId:      string;
		reactions?:  ReactionSummary[];
		thanksCount?: number;
		userThanked?: boolean;
		isOwnPost?:  boolean;
		isLoggedIn?: boolean;
	} = $props();

	const EMOJIS = ['👍', '❤️', '🔥', '😂', '😮', '😢'];

	function reactionFor(emoji: string): ReactionSummary | undefined {
		return reactions.find(r => r.emoji === emoji);
	}
</script>

<div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-800/60">
	<!-- Emoji reactions -->
	{#each EMOJIS as emoji}
		{@const r = reactionFor(emoji)}
		{#if isLoggedIn}
			<form method="POST" action="?/reactPost" use:enhance={() => {
				return async ({ update }) => { await update({ reset: false }) }
			}}>
				<input type="hidden" name="post_id" value={postId} />
				<input type="hidden" name="emoji"   value={emoji} />
				<button
					type="submit"
					class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors
					{r?.user_reacted
						? 'border-indigo-600 bg-indigo-900/40 text-indigo-300'
						: 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-600 hover:text-gray-300'}"
					title="{emoji}"
				>
					<span>{emoji}</span>
					{#if r && r.count > 0}
						<span>{r.count}</span>
					{/if}
				</button>
			</form>
		{:else if r && r.count > 0}
			<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-gray-700 bg-gray-800/40 text-gray-400">
				<span>{emoji}</span>
				<span>{r.count}</span>
			</span>
		{/if}
	{/each}

	<!-- Thanks button -->
	{#if isLoggedIn && !isOwnPost}
		<form method="POST" action="?/thankPost" use:enhance={() => {
			return async ({ update }) => { await update({ reset: false }) }
		}} class="ml-auto">
			<input type="hidden" name="post_id" value={postId} />
			<button
				type="submit"
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors
				{userThanked
					? 'border-yellow-600 bg-yellow-900/30 text-yellow-300'
					: 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-yellow-600 hover:text-yellow-300'}"
			>
				<span>🙏</span>
				<span>Merci{thanksCount > 0 ? ` (${thanksCount})` : ''}</span>
			</button>
		</form>
	{:else if thanksCount > 0}
		<span class="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-gray-700 bg-gray-800/40 text-gray-500">
			🙏 {thanksCount}
		</span>
	{/if}
</div>
