<script lang="ts">
	import { app } from '$lib/config';
	import Footer from '$lib/components/Footer.svelte';

	function handleLogin() {
		window.location.href = `/dashboard`;
	}
</script>

<div class="bg-base-100 text-base-content flex min-h-screen flex-col">
	<!-- navbar -->
	<div class="px-6 py-4 border-base-300 flex w-full items-center justify-between border-b">
		<div class="text-xl font-bold">{app.name}</div>
		<button class="btn btn-primary" onclick={handleLogin}>login</button>
	</div>

    <main class="flex-1">

    </main>
	
	<Footer />
</div>
