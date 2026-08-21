<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { afterNavigate } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
	let { children, data } = $props();

	afterNavigate(() => {
		window.HSStaticMethods.autoInit();
	});
</script>

<Navbar user={data.user} apiUrl={data.apiUrl} />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
