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
	let selectedDateString: string | undefined;
	$: selectedDate = selectedDateString ? new Date(selectedDateString) : undefined;
	$: isTodayBirthday =
		selectedDate?.getDate() === currentDate.getDate() &&
		selectedDate?.getMonth() === currentDate.getMonth();

	let chartData: ChartData | undefined;
	let spotifyClient: SpotifyClient | undefined;
	let username: string | null = null;
	onMount(async () => {
		chartData = await getChartData();
		spotifyClient = new SpotifyClient();
		username = await spotifyClient.getProfileName();
	});

	let loggingOut = false;
	const logout = async () => {
		loggingOut = true;
		await spotifyClient?.logout();
		loggingOut = false;
		username = null;
	};

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
	{#if spotifyClient && !loggingOut}
		{#if username}
			<p>Logged in as {username}</p>
			<button on:click={logout}>Logout</button>
		{:else}
			<p>Not logged in</p>
			<button on:click={spotifyClient.login}>Login with Spotify</button>
		{/if}
	{:else}
		<p>Loading...</p>
	{/if}
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
			<p>
				{item.date.year}
				<br />
				{item.numberOne?.title}
				<br />
				<i>{item.numberOne?.artist}</i>
			</p>
		{/each}
	{/if}
</div>
