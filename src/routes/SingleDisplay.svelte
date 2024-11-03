<script lang="ts">
	import { type ChartEntry } from '$lib/birthday-number-ones';

	export let numberOne: ChartEntry;
</script>

{#if numberOne.spotifyTrack}
	<a
		href={numberOne.spotifyTrack.external_urls.spotify}
		target="_blank"
		rel="noopener noreferrer"
		class="text-rose-600 underline hover:text-rose-800"
		>{numberOne.spotifyTrack.name}<br />{numberOne.spotifyTrack.artists
			.map((a) => a.name)
			.join(', ')}</a
	>
	<p class="text-xs text-zinc-500 pt-2">
		{numberOne.title} - {numberOne.artist}
	</p>
{:else}
	{numberOne.title}
	<br />
	<i>{numberOne.artist}</i>
{/if}
