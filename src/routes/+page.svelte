<script lang="ts">
	import { NoDataReason, type BirthdayNumberOnes, type ChartData } from '$lib/birthday-number-ones';
	import { findBirthdayNumberOnes, getChartData } from '$lib/chart-data';
	import { SpotifyClient, type SpotifyProfile } from '$lib/spotify';
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
	let profile: SpotifyProfile | null = null;
	onMount(async () => {
		chartData = await getChartData();
		spotifyClient = new SpotifyClient();
		profile = await spotifyClient.getProfile();
	});

	let loggingOut = false;
	const logout = async () => {
		loggingOut = true;
		profile = null;
		await spotifyClient?.logout();
		loggingOut = false;
	};

	let birthdayNumberOnes: BirthdayNumberOnes | undefined;
	$: {
		if (!selectedDate || !chartData || selectedDate < minDate || selectedDate > currentDate) {
			birthdayNumberOnes = undefined;
		} else {
			birthdayNumberOnes = findBirthdayNumberOnes(selectedDate, chartData);
		}
	}

	const populateBirthdayNumberOnes = async () => {
		if (!birthdayNumberOnes) return;
		birthdayNumberOnes = await spotifyClient?.populateSpotifyInfo(birthdayNumberOnes);
	};

	const noDataReasons = {
		[NoDataReason.DATE_TOO_OLD]: 'Birthday precedes the start of the chart data',
		[NoDataReason.NO_DATA_YET]: 'No chart data yet available for this date'
	};
</script>

<h1>Birthday Playlist Generator</h1>
<p>Generate a Spotify playlist of UK number 1 singles on all your past birthdays.</p>
<p>This site is currently <i>under construction</i>.</p>
<div>
	{#if spotifyClient && !loggingOut}
		{#if profile}
			<p>Logged in as {profile.displayName}</p>
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

{#if profile && birthdayNumberOnes}
	<div>
		<button on:click={populateBirthdayNumberOnes}>Sync Spotify data</button>
	</div>
{/if}

{#if birthdayNumberOnes}
	<div>
		{#each birthdayNumberOnes as item}
			<p>
				{item.date.year}
				<br />
				{item.numberOne?.title || (item.reason ? noDataReasons[item.reason] : 'No data')}
				<br />
				<i>{item.numberOne?.artist || ''}</i>
				{#if item.numberOne?.spotifyTrack}
					<br />
					<a
						href={item.numberOne.spotifyTrack.external_urls.spotify}
						target="_blank"
						rel="noopener noreferrer"
						>{item.numberOne.spotifyTrack.name} - {item.numberOne.spotifyTrack.artists
							.map((a) => a.name)
							.join(', ')}</a
					>
				{/if}
			</p>
		{/each}
	</div>
{/if}
