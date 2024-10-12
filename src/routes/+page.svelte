<script lang="ts">
	const currentDate = new Date();
	let selectedDateString: string | undefined = undefined;
	$: selectedDate = selectedDateString ? new Date(selectedDateString) : undefined;
	$: isBirthday =
		selectedDate?.getDate() === currentDate.getDate() &&
		selectedDate?.getMonth() === currentDate.getMonth();

	const onClick = () => {
		console.log(selectedDateString && new Date(selectedDateString));
	};
</script>

<h1>Birthday Playlist Generator</h1>
<p>Generate a Spotify playlist of UK number 1 singles on all your past birthdays.</p>
<input type="date" bind:value={selectedDateString} />
{#if isBirthday}
	<p>Happy Birthday!</p>
{/if}
<div>
	<button on:click={onClick}>Generate Playlist</button>
</div>
