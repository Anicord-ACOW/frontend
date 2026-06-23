<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();

	const user = $derived(data.user!);
	const form = $derived(data.signupForm);

	const participationFields = [
		{ key: 'extremeSpecialParticipation', label: 'Extreme Special' },
		{ key: 'sponsorParticipation', label: 'Sponsor' },
		{ key: 'aidParadeParticipation', label: 'Aid Parade' },
		{ key: 'competitiveBlitzParticipation', label: 'Competitive Blitz' },
		{ key: 'casualBlitzParticipation', label: 'Casual Blitz' },
		{ key: 'bookClubParticipation', label: 'Book Club' },
		{ key: 'gameClubParticipation', label: 'Game Club' }
	] as const;

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Dashboard | {user.username}</title>
</svelte:head>

<div class="bg-base-100 text-base-content flex min-h-screen flex-col">
	<Navbar user={data.user} />

	<main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto space-y-6">

			<!-- ── Profile Card ───────────────────────────────────────────── -->
			<div class="rounded-2xl border border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden">
				<!-- subtle gradient top strip -->
				<div class="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary"></div>

				<div class="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
					<!-- Avatar -->
					<div class="relative shrink-0">
						<img
							src={user.avatarUrl}
							alt={user.username}
							class="h-24 w-24 rounded-2xl object-cover ring-2 ring-primary/30 shadow-lg"
						/>
						<!-- Online indicator -->
						<span class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-base-200"></span>
					</div>

					<!-- Info -->
					<div class="flex-1 text-center sm:text-left space-y-1">
						<h1 class="text-2xl font-extrabold tracking-tight">{user.username}</h1>
						<p class="text-sm text-base-content/50 font-mono">#{user.id}</p>
						<div class="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
							<span class="badge badge-primary badge-soft gap-1.5">
								<span class="icon-[tabler--calendar] text-xs"></span>
								Member since {formatDate(user.createdAt)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- ── Form Info Card ─────────────────────────────────────────── -->
			<div class="rounded-2xl border border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden">
				<div class="h-1 w-full bg-gradient-to-r from-secondary via-info to-primary"></div>

				<div class="p-6 space-y-6">
					<h2 class="text-lg font-bold flex items-center gap-2">
						<span class="icon-[tabler--clipboard-list] text-primary text-xl"></span>
						Server Form
					</h2>

					{#if !form}
						<div class="text-center py-10 text-base-content/40 space-y-2">
							<span class="icon-[tabler--file-unknown] text-4xl block mx-auto"></span>
							<p class="text-sm">No form submitted yet.</p>
						</div>
					{:else}
						<!-- Text fields grid -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

							{#each [
								{ key: 'repServer',       label: 'Representative Server',  icon: 'icon-[tabler--server]' },
								{ key: 'anilistUrl',      label: 'AniList URL',             icon: 'icon-[tabler--link]' },
								{ key: 'preferredMedium', label: 'Preferred Medium',         icon: 'icon-[tabler--heart]' },
								{ key: 'acceptingMedium', label: 'Accepting Medium',         icon: 'icon-[tabler--checkbox]' },
								{ key: 'preferredGenres', label: 'Preferred Genres',         icon: 'icon-[tabler--tags]' },
								{ key: 'bannedGenres',    label: 'Banned Genres',            icon: 'icon-[tabler--ban]' }
							] as field}
								<div class="rounded-xl bg-base-300/40 p-4 space-y-1">
									<p class="text-xs text-base-content/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
										<span class="{field.icon} text-sm text-primary/70"></span>
										{field.label}
									</p>
									<p class="text-sm font-medium {form[field.key] ? '' : 'text-base-content/30 italic'}">
										{form[field.key] || 'Not filled in'}
									</p>
								</div>
							{/each}

						</div>

						<!-- Participation badges -->
						<div class="space-y-2">
							<p class="text-xs text-base-content/50 font-medium uppercase tracking-wider">Event Participation</p>
							<div class="flex flex-wrap gap-2">
								{#each participationFields as { key, label }}
									<span class="badge gap-1.5 {form[key] ? 'badge-success badge-soft' : 'badge-ghost opacity-50'}">
										<span class="icon-[tabler--{form[key] ? 'circle-check' : 'circle-x'}] text-xs"></span>
										{label}
									</span>
								{/each}
							</div>
						</div>

						<!-- Notes -->
						{#if form.notesForStaff || form.notesForContractor}
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{#if form.notesForStaff}
									<div class="rounded-xl bg-base-300/40 p-4 space-y-1">
										<p class="text-xs text-base-content/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
											<span class="icon-[tabler--note] text-sm text-primary/70"></span>
											Notes for Staff
										</p>
										<p class="text-sm">{form.notesForStaff}</p>
									</div>
								{/if}
								{#if form.notesForContractor}
									<div class="rounded-xl bg-base-300/40 p-4 space-y-1">
										<p class="text-xs text-base-content/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
											<span class="icon-[tabler--note] text-sm text-primary/70"></span>
											Notes for Contractor
										</p>
										<p class="text-sm">{form.notesForContractor}</p>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Form meta -->
						<p class="text-xs text-base-content/30 text-right">
							Last updated {formatDate(form.updatedAt)}
						</p>
					{/if}
				</div>
			</div>

		</div>
	</main>

	<Footer />
</div>
