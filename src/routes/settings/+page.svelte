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
	<!--<Navbar user={data.user} apiUrl={data.apiUrl} /> -->

	<main class="px-4 py-8 sm:px-6 lg:px-8 flex-1">
		<div class="max-w-4xl space-y-6 mx-auto">
			<!-- ── Cards handler ───────────────────────────────────────────── -->
			<div
				class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
			>
				<!-- subtle gradient top strip -->
				<div class="h-1 from-primary via-accent to-secondary w-full bg-gradient-to-r"></div>

				<div class="p-6 sm:flex-row sm:items-start gap-6 flex flex-col items-center">
					<!-- Avatar -->
					<div class="relative shrink-0">
						<img
							src={user.avatarUrl}
							alt={user.username}
							class="h-24 w-24 rounded-2xl ring-primary/30 shadow-lg object-cover ring-2"
						/>
						<!-- Online indicator -->
						<span
							class="-bottom-1 -right-1 h-4 w-4 bg-success border-base-200 absolute rounded-full border-2"
						></span>
					</div>

					<!-- Info -->
					<div class="sm:text-left space-y-1 flex-1 text-center">
						<h1 class="text-2xl font-extrabold tracking-tight">{user.username}</h1>
						<p class="text-sm text-base-content/50 font-mono">#{user.id}</p>
						<div class="gap-2 sm:justify-start pt-2 flex flex-wrap justify-center">
							<span class="badge badge-primary badge-soft gap-1.5">
								<span class="icon-[tabler--calendar] text-xs"></span>
								Member since {formatDate(user.createdAt)}
							</span>
						</div>
					</div>

					<!-- Edit Action -->
					<div class="sm:self-center sm:justify-end flex justify-center self-stretch">
						<a href="/settings/form" class="btn btn-primary gap-2">
							<span class="icon-[tabler--edit] text-lg"></span>
							Edit Form
						</a>
					</div>
				</div>
			</div>

			<!-- ── Anime/Manga/Manwha ─────────────────────────────────────────── -->
			<div
				class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
			>
				<div class="h-1 from-secondary via-info to-primary w-full bg-gradient-to-r"></div>

				<div class="p-6 space-y-6">
					<h2 class="text-lg font-bold gap-2 flex items-center">
						<span class="icon-[tabler--clipboard-list] text-primary text-xl"></span>
						Animes - Mangas - Manwhas
					</h2>

					{#if !form}
						<div class="py-10 text-base-content/40 space-y-2 text-center">
							<span class="icon-[tabler--file-unknown] text-4xl mx-auto block"></span>
							<p class="text-sm">No form submitted yet.</p>
						</div>
					{:else}
						<!-- Text fields grid -->
						<div class="sm:grid-cols-2 gap-4 grid grid-cols-1">
							{#each [{ key: 'repServer', label: 'Representative Server', icon: 'icon-[tabler--server]' }, { key: 'anilistUrl', label: 'AniList URL', icon: 'icon-[tabler--link]' }, { key: 'preferredMedium', label: 'Preferred Medium', icon: 'icon-[tabler--heart]' }, { key: 'acceptingMedium', label: 'Accepting Medium', icon: 'icon-[tabler--checkbox]' }, { key: 'preferredGenres', label: 'Preferred Genres', icon: 'icon-[tabler--tags]' }, { key: 'bannedGenres', label: 'Banned Genres', icon: 'icon-[tabler--ban]' }] as field}
								<div class="rounded-xl bg-base-300/40 p-4 space-y-1">
									<p
										class="text-xs text-base-content/50 font-medium tracking-wider gap-1.5 flex items-center uppercase"
									>
										<span class="{field.icon} text-sm text-primary/70"></span>
										{field.label}
									</p>
									<p
										class="text-sm font-medium {form[field.key]
											? ''
											: 'text-base-content/30 italic'}"
									>
										{form[field.key] || 'Not filled in'}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- ── Games ─────────────────────────────────────────── -->
			<div
				class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
			>
				<div class="h-1 from-secondary via-info to-primary w-full bg-gradient-to-r"></div>

				<div class="p-6 space-y-6">
					<h2 class="text-lg font-bold gap-2 flex items-center">
						<span class="icon-[tabler--clipboard-list] text-primary text-xl"></span>
						Games
					</h2>

					{#if !form}
						<div class="py-10 text-base-content/40 space-y-2 text-center">
							<span class="icon-[tabler--file-unknown] text-4xl mx-auto block"></span>
							<p class="text-sm">No form submitted yet.</p>
						</div>
					{:else}
						<!-- Text fields grid -->
						<div class="sm:grid-cols-2 gap-4 grid grid-cols-1">
							{#each [{ key: 'gameProfileUrl', label: 'Steam/Xbox/Gog/etc Link', icon: 'icon-[tabler--server]' }, { key: 'pcPower', label: 'PC/Console Performance', icon: 'icon-[tabler--brand-speedtest]' }, { key: 'hasXboxGamePass', label: 'Xbox Game Pass', icon: 'icon-[tabler--brand-xbox]' }, { key: 'challengeLevelPreference', label: 'Preferred Challenge Level', icon: 'icon-[tabler--target]' }, { key: 'gameLengthPreference', label: 'Preferred Game Length', icon: 'icon-[tabler--calendar-event]' }] as field}
								<div class="rounded-xl bg-base-300/40 p-4 space-y-1">
									<p
										class="text-xs text-base-content/50 font-medium tracking-wider gap-1.5 flex items-center uppercase"
									>
										<span class="{field.icon} text-sm text-primary/70"></span>
										{field.label}
									</p>
									<p
										class="text-sm font-medium {form[field.key]
											? ''
											: 'text-base-content/30 italic'}"
									>
										{form[field.key] || 'Not filled in'}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- ── Other ─────────────────────────────────────────── -->
			<div
				class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
			>
				<div class="h-1 from-secondary via-info to-primary w-full bg-gradient-to-r"></div>

				<div class="p-6 space-y-6">
					<h2 class="text-lg font-bold gap-2 flex items-center">
						<span class="icon-[tabler--clipboard-list] text-primary text-xl"></span>
						Other
					</h2>

					{#if !form}
						<div class="py-10 text-base-content/40 space-y-2 text-center">
							<span class="icon-[tabler--file-unknown] text-4xl mx-auto block"></span>
							<p class="text-sm">No form submitted yet.</p>
						</div>
					{:else}
						<!-- Participation badges -->
						<div class="space-y-2">
							<p class="text-xs text-base-content/50 font-medium tracking-wider uppercase">
								Event Participation
							</p>
							<div class="gap-2 flex flex-wrap">
								{#each participationFields as { key, label }}
									<span
										class="badge gap-1.5 {form[key]
											? 'badge-success badge-soft'
											: 'badge-ghost opacity-50'}"
									>
										<span class="icon-[tabler--{form[key] ? 'circle-check' : 'circle-x'}] text-xs"
										></span>
										{label}
									</span>
								{/each}
							</div>
						</div>

						<!-- Notes -->
						{#if form.notesForStaff || form.notesForContractor}
							<div class="sm:grid-cols-2 gap-4 grid grid-cols-1">
								{#if form.notesForStaff}
									<div class="rounded-xl bg-base-300/40 p-4 space-y-1">
										<p
											class="text-xs text-base-content/50 font-medium tracking-wider gap-1.5 flex items-center uppercase"
										>
											<span class="icon-[tabler--note] text-sm text-primary/70"></span>
											Notes for Staff
										</p>
										<p class="text-sm">{form.notesForStaff}</p>
									</div>
								{/if}
								{#if form.notesForContractor}
									<div class="rounded-xl bg-base-300/40 p-4 space-y-1">
										<p
											class="text-xs text-base-content/50 font-medium tracking-wider gap-1.5 flex items-center uppercase"
										>
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
