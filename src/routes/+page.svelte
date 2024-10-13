<script lang="ts">
	import {
		findBirthdayNumberOnes,
		getChartData,
		type BirthdayNumberOnes,
		type ChartData
	} from '$lib/chart-data';
	import { SpotifyClient } from '$lib/spotify';
	import { onMount } from 'svelte';

	const currentDate = new Date();
	const minDate = new Date(1900, 0, 1);
	let selectedDateString: string | undefined = undefined;
	$: selectedDate = selectedDateString ? new Date(selectedDateString) : undefined;
	$: isTodayBirthday =
		selectedDate?.getDate() === currentDate.getDate() &&
		selectedDate?.getMonth() === currentDate.getMonth();

	let chartData: ChartData | undefined = undefined;
	let spotifyClient: SpotifyClient | undefined = undefined;
	onMount(async () => {
		chartData = await getChartData();
		spotifyClient = new SpotifyClient();
	});

	let birthdayNumberOnes: BirthdayNumberOnes | undefined;
	$: {
		if (!selectedDate || !chartData || selectedDate < minDate || selectedDate > currentDate) {
			birthdayNumberOnes = undefined;
		} else {
			birthdayNumberOnes = findBirthdayNumberOnes(selectedDate, chartData);
		}
	}
</script>

<h1>Birthday Playlist Generator</h1>
<p>Generate a Spotify playlist of UK number 1 singles on all your past birthdays.</p>
<div>
	<button on:click={spotifyClient ? spotifyClient.login : () => {}}>Login with Spotify</button>
</div>
<label>
	Your date of birth:
	<input
		type="date"
		bind:value={selectedDateString}
		min={minDate.toISOString().split('T')[0]}
		max={currentDate.toISOString().split('T')[0]}
	/>
</label>
{#if isTodayBirthday}
	<p>Happy Birthday!</p>
{/if}
<div>
	{#if birthdayNumberOnes}
		{#each birthdayNumberOnes as item}
			<div>
				<p>{item.numberOne?.title}</p>
				<p><i>{item.numberOne?.artist}</i></p>
			</div>
		{/each}
	{/if}
</div>

<button on:click={() => spotifyClient?.getUser()?.then(console.log)}>Get user</button>
