<script lang="ts">
	import { type Birthday, noDataReasonStrings } from '$lib/birthday-number-ones';
	import SingleDisplay from './SingleDisplay.svelte';

	export let birthdayNumberOne: Birthday;
</script>

<div
	class="flex flex-col p-4 bg-zinc-50 drop-shadow-lg rounded-lg w-60 h-80 m-10 align-middle text-center"
>
	<p class="text-xl font-bold">{birthdayNumberOne.date.year}</p>
	{#if birthdayNumberOne.numberOne}
		<SingleDisplay numberOne={birthdayNumberOne.numberOne} />
	{:else}
		{birthdayNumberOne.reason ? noDataReasonStrings[birthdayNumberOne.reason] : 'No data'}
	{/if}
</div>
