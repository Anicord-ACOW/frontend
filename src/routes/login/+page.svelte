<script lang="ts">
	import { app } from '$lib/config';

	let { data } = $props();

	function handleDiscordLogin() {
		// Redirect to the Discord OAuth endpoint of the API
		const apiUrl = (data as any).apiUrl as string;
		window.location.href = `${apiUrl}/auth/discord/login`;
	}
</script>

<svelte:head>
	<title>Login | {app.name}</title>
	<meta
		name="description"
		content="Sign in to the Anicord Events Server dashboard using your Discord account."
	/>
</svelte:head>

<div
	class="bg-base-100 px-4 py-12 sm:px-6 lg:px-8 relative flex min-h-screen items-center justify-center overflow-hidden"
>
	<!-- Background decorative glows for high-end glassmorphism look -->
	<div
		class="-top-40 -left-40 h-96 w-96 bg-primary/10 blur-3xl animate-pulse absolute rounded-full filter duration-4000"
	></div>
	<div
		class="-bottom-40 -right-40 h-96 w-96 bg-secondary/15 blur-3xl animate-pulse absolute rounded-full filter duration-6000"
	></div>
	<div
		class="bg-accent/5 blur-3xl absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full filter"
	></div>

	<!-- Login Card -->
	<div
		class="max-w-md rounded-2xl border-base-300/40 bg-base-200/40 p-8 shadow-2xl backdrop-blur-xl hover:shadow-primary/5 hover:border-base-300 relative w-full transform overflow-hidden border transition-all duration-300"
	>
		<!-- Inner subtle gradient borders -->
		<div
			class="inset-0 from-primary/5 to-secondary/10 absolute -z-10 bg-gradient-to-tr via-transparent opacity-50"
		></div>

		<!-- Content container -->
		<div class="space-y-8 flex flex-col items-center text-center">
			<!-- App Logo Icon -->
			<div
				class="h-16 w-16 rounded-2xl bg-base-300/50 p-2 shadow-lg border-base-300/40 flex transform items-center justify-center border transition-transform duration-300 hover:scale-105"
			>
				<img src="/Anicord_Logo.png" alt="Anicord Logo" class="h-full w-full object-contain" />
			</div>

			<!-- Text Heading -->
			<div class="space-y-2">
				<h1
					class="text-3xl font-extrabold tracking-tight from-primary via-neutral to-info bg-gradient-to-r bg-clip-text text-transparent"
				>
					{app.name}
				</h1>
				<p class="text-sm text-base-content/60">Welcome back! Sign in to access your dashboard</p>
			</div>

			<!-- Divider line -->
			<div class="border-base-300/50 w-full border-t"></div>

			<!-- Login Buttons Area -->
			<div class="space-y-4 w-full">
				<button
					onclick={handleDiscordLogin}
					class="group gap-3 rounded-xl px-6 py-4 text-base font-semibold text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0 relative flex w-full cursor-pointer items-center justify-center bg-[#5865F2] shadow-[#5865F2]/20 transition-all duration-200 hover:bg-[#4752C4] hover:shadow-[#4752C4]/35 active:scale-98"
				>
					<!-- Discord Icon -->
					<span
						class="icon-[tabler--brand-discord-filled] text-2xl transition-transform group-hover:scale-110"
					></span>
					<span>Sign in with Discord</span>

					<!-- Inner light overlay on hover -->
					<span
						class="inset-0 rounded-xl bg-white/5 absolute opacity-0 transition-opacity group-hover:opacity-100"
					></span>
				</button>
			</div>

			<!-- Footer/Go Back Link -->
			<div class="text-xs text-base-content/40 space-y-3 flex flex-col">
				<p>By logging in, you agree to our Terms of Service.</p>
				<div class="pt-2">
					<a
						href="/"
						class="hover:text-primary gap-1.5 font-medium inline-flex items-center transition-colors duration-200"
					>
						<span class="icon-[tabler--arrow-left] text-sm"></span> Back to home
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
