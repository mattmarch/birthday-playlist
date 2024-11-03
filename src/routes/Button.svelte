<script lang="ts">
	export let disabled: boolean = false;
</script>

<button
	on:click
	{disabled}
	class="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
	><slot /></button
>
