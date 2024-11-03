<script lang="ts">
	import { type BirthdayNumberOnes, type ChartData } from '$lib/birthday-number-ones';
	import { findBirthdayNumberOnes, getChartData } from '$lib/chart-data';
	import { SpotifyClient, type SpotifyProfile } from '$lib/spotify';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import Button from './Button.svelte';
	import SingleCard from './SingleCard.svelte';

	const currentDate = new Date();
	const minDate = new Date(1900, 0, 1);
	let selectedDateString: string | undefined = $page.url.searchParams.get('date') || undefined;
	$: selectedDate = selectedDateString ? new Date(selectedDateString) : undefined;
	$: isTodayBirthday =
		selectedDate?.getDate() === currentDate.getDate() &&
		selectedDate?.getMonth() === currentDate.getMonth();

	const updateUrl = () => {
		$page.url.searchParams.set('date', selectedDateString || '');
		replaceState($page.url, $page.state);
	};

	let chartData: ChartData | undefined;
	let spotifyClient: SpotifyClient | undefined;
	let profile: SpotifyProfile | null = null;
	onMount(async () => {
		chartData = await getChartData();
		spotifyClient = new SpotifyClient();
		if (await spotifyClient.isLoggedIn()) {
			try {
				profile = await spotifyClient.getProfile();
			} catch {
				alert('Something went wrong authenticating with Spotify.');
			}
		}
	});

	const login = () => {
		if (!spotifyClient) {
			console.error('Spotify client undefined - this should not happen');
			return;
		}
		spotifyClient.login(selectedDateString);
	};

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
</script>

<div
	class="flex flex-col align-middle min-h-screen p-8 gap-4 bg-gradient-to-br from-rose-50 via-rose-100 to-rose-200"
>
	<div class="flex flex-col gap-3">
		<div class="flex flex-row justify-between items-baseline flex-wrap">
			<h1 class="text-rose-900 text-3xl w-fit">🎂 Birthday Playlist 🎂</h1>
			<div class="py-4">
				{#if spotifyClient && !loggingOut}
					{#if profile}
						<span class="text-center pr-1">Hello <strong>{profile.displayName}</strong>!</span>
						<Button on:click={logout}>Logout</Button>
					{:else}
						<Button on:click={login}>Login with Spotify</Button>
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
		Enter your date of birth to get started: <br />
		<input
			type="date"
			bind:value={selectedDateString}
			min={minDate.toISOString().split('T')[0]}
			max={currentDate.toISOString().split('T')[0]}
			on:change={updateUrl}
			class="mt-2 ml-4"
		/>
	</label>
	{#if isTodayBirthday}
		<p class="text-lg">Happy Birthday! 🎉🎉🎉</p>
	{/if}

	{#if profile && birthdayNumberOnes}
		<div>
			{#if lastPlaylistUrl}
				<p>
					<a
						href={lastPlaylistUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-rose-600 underline hover:text-rose-800">Go to your playlist</a
					>
				</p>
			{/if}
			{#if populatedFromSpotify}
				<Button on:click={createPlaylist} disabled={creatingPlaylist}>Create playlist</Button>
			{:else}
				<Button on:click={populateBirthdayNumberOnes}>Sync Spotify data</Button>
			{/if}
		</div>
	{/if}

	{#if birthdayNumberOnes}
		<div class="flex flex-wrap justify-center">
			{#each birthdayNumberOnes as item}
				<SingleCard birthdayNumberOne={item} />
			{/each}
		</div>
	{/if}
</div>
