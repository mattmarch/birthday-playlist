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
		if (await spotifyClient.isLoggedIn()) {
			profile = await spotifyClient.getProfile();
		}
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
	$: populatedFromSpotify = birthdayNumberOnes?.some((item) => item.numberOne?.spotifyTrack);
	const populateBirthdayNumberOnes = async () => {
		if (!birthdayNumberOnes) return;
		birthdayNumberOnes = await spotifyClient?.populateSpotifyInfo(birthdayNumberOnes);
	};

	let lastPlaylistUrl: string | undefined;
	let creatingPlaylist = false;
	const createPlaylist = async () => {
		creatingPlaylist = true;
		if (!birthdayNumberOnes || !profile) return;
		lastPlaylistUrl = await spotifyClient?.createPlaylist(birthdayNumberOnes, profile.id);
		creatingPlaylist = false;
	};

	const noDataReasons = {
		[NoDataReason.DATE_TOO_OLD]: 'Birthday precedes the start of the chart data',
		[NoDataReason.NO_DATA_YET]: 'No chart data yet available for this date'
	};
</script>

<div
	class="flex flex-col align-middle min-h-screen p-8 gap-4 bg-gradient-to-br from-rose-50 via-rose-100 to-rose-200"
>
	<div class="flex flex-col gap-3">
		<div class="flex flex-row justify-between items-baseline flex-wrap">
			<h1 class="text-rose-900 text-3xl w-fit">🎂 Birthday Playlist Generator 🎂</h1>
			<div class="py-4">
				{#if spotifyClient && !loggingOut}
					{#if profile}
						<span class="text-center pr-1">Hello <strong>{profile.displayName}</strong>!</span>
						<button
							on:click={logout}
							class="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
							>Logout</button
						>
					{:else}
						<button
							on:click={spotifyClient.login}
							class="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
							>Login with Spotify</button
						>
					{/if}
				{:else}
					<span>Loading...</span>
				{/if}
			</div>
		</div>
		<p class="italic text-zinc-800">
			Generate a Spotify playlist of UK number 1 singles on all your past birthdays.
		</p>
		<p class="text-zinc-800">🚧 This site is currently <i>under construction</i> 🚧</p>
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
			{#if lastPlaylistUrl}
				<p>
					<a href={lastPlaylistUrl} target="_blank" rel="noopener noreferrer">Go to your playlist</a
					>
				</p>
			{/if}
			{#if populatedFromSpotify}
				<p>Spotify data synced</p>
				<button on:click={createPlaylist} disabled={creatingPlaylist}>Create playlist</button>
			{:else}
				<p>Spotify data not synced</p>
				<button on:click={populateBirthdayNumberOnes}>Sync Spotify data</button>
			{/if}
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
</div>
