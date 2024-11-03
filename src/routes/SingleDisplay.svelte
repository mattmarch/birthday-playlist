<script lang="ts">
	import { type ChartEntry } from '$lib/birthday-number-ones';
	export let numberOne: ChartEntry;

	$: artwork = numberOne.spotifyTrack?.album.images[0]?.url;
</script>

{#if artwork}
	<img
		src={artwork}
		alt={`Album artwork for ${numberOne.title}`}
		height="140"
		width="140"
		class="my-2"
	/>
{:else}
	<div class="h-[140px] w-[140px] bg-zinc-200 rounded my-2 flex items-center justify-center">
		<div class="h-[120px] w-[120px] rounded-[60px] bg-zinc-400"></div>
	</div>
{/if}
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
