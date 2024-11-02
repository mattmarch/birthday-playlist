<script lang="ts">
	import { goto } from '$app/navigation';
	import { SpotifyClient } from '$lib/spotify';
	import { onMount } from 'svelte';

	onMount(async () => {
		const spotifyClient = new SpotifyClient();
		const result = await spotifyClient.loginCallback();
		console.log(result);
		await goto('/');
	});
</script>

<p>Redirecting...</p>
