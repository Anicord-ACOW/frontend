<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { app } from '$lib/config';

	let { data } = $props();

	let statusMessage = $state('Connecting to Discord...');
	let errorMessage = $state<string | null>(null);

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');

		if (!code) {
			errorMessage = 'No authorization code found. Redirecting back...';
			setTimeout(() => goto('/'), 2500);
			return;
		}

		try {
			statusMessage = 'Verifying credentials with the server...';
			const apiUrl = (data as any).apiUrl as string;

			// Request the backend to exchange the Discord code for a session/token
			// We include credentials in case the backend sets an HTTP-only cookie.
			const response = await fetch(`${apiUrl}/auth/discord/callback?code=${code}`, {
				method: 'GET',
				headers: {
					Accept: 'application/json'
				},
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error(`Server returned status: ${response.status}`);
			}

			const responseData = await response.json();

			// If backend returns a token in the body, store it in cookies & localStorage
			if (responseData && responseData.token) {
				document.cookie = `token=${responseData.token}; path=/; max-age=604800; SameSite=Lax; Secure`;
				localStorage.setItem('token', responseData.token);
			}

			statusMessage = 'Success! Welcome to Anicord. Redirecting...';
			setTimeout(() => goto('/'), 1200);
		} catch (err) {
			console.error('Authentication callback error:', err);
		}
	});
</script>

<svelte:head>
	<title>Authenticating | {app.name}</title>
</svelte:head>

<div
	class="bg-base-100 px-4 py-12 sm:px-6 lg:px-8 relative flex min-h-screen items-center justify-center overflow-hidden"
>
	<!-- Background decorative glows -->
	<div
		class="-top-40 -left-40 h-96 w-96 bg-primary/10 blur-3xl animate-pulse absolute rounded-full filter duration-4000"
	></div>
	<div
		class="-bottom-40 -right-40 h-96 w-96 bg-secondary/15 blur-3xl animate-pulse absolute rounded-full filter duration-6000"
	></div>
	<div
		class="bg-accent/5 blur-3xl absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full filter"
	></div>

	<!-- Card container -->
	<div
		class="max-w-md rounded-2xl border-base-300/40 bg-base-200/40 p-8 shadow-2xl backdrop-blur-xl relative w-full transform overflow-hidden border transition-all duration-300"
	>
		<div
			class="inset-0 from-primary/5 to-secondary/10 absolute -z-10 bg-gradient-to-tr via-transparent opacity-50"
		></div>

		<div class="space-y-8 flex flex-col items-center text-center">
			<!-- Animated loader / status representation -->
			{#if errorMessage}
				<!-- Error state -->
				<div
					class="h-16 w-16 rounded-2xl bg-error/20 text-error shadow-lg shadow-error/15 animate-bounce flex items-center justify-center"
				>
					<span class="icon-[tabler--alert-triangle] text-3xl"></span>
				</div>
			{:else}
				<!-- Loading state -->
				<div class="relative flex items-center justify-center">
					<!-- Outer ring -->
					<div
						class="h-20 w-20 border-primary/20 border-t-primary animate-spin rounded-full border-4"
					></div>
					<!-- Inner logo pulsing -->
					<div class="h-10 w-10 animate-pulse absolute">
						<img
							src="/Anicord_Logo.png"
							alt="Logo"
							class="h-full w-full object-contain opacity-80"
						/>
					</div>
				</div>
			{/if}

			<!-- Text statuses -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-base-content">
					{#if errorMessage}
						Authentication Failed
					{:else}
						Completing Sign In
					{/if}
				</h2>

				<p
					class="text-sm {errorMessage
						? 'text-error'
						: 'text-base-content/70'} max-w-xs transition-colors duration-300"
				>
					{errorMessage || statusMessage}
				</p>
			</div>

			<!-- Footer redirect links -->
			{#if errorMessage}
				<div class="pt-4 w-full">
					<a href="/" class="btn btn-outline btn-error btn-sm gap-2 w-full">
						<span class="icon-[tabler--arrow-left] text-sm"></span> Return to Home
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
