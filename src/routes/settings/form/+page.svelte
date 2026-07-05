<script lang="ts">
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data, form } = $props();

	const f = $derived(data.signupForm ?? {});

	// Whether a genre is currently selected (for pre-filling checkboxes)
	function hasGenre(genre: string): boolean {
		const genres: string[] = f.preferredGameGenres ?? [];
		return genres.includes(genre);
	}

	let saving = $state(false);

	const GAME_GENRES = [
		'PLATFORMERS',
		'PUZZLES',
		'WESTERN_RPGS',
		'JRPGS',
		'CRPGS',
		'ARPGS',
		'ACTION_ADVENTURE',
		'ROGUELIKE',
		'STRATEGY',
		'SIMULATION',
		'VISUAL_NOVEL',
		'FIGHTING',
		'RACING',
		'SHOOTERS',
		'RHYTHM',
		'CASUAL',
		'METROIDVANIA',
		'BULLET_HELL',
		'BULLET_HEAVEN',
		'DATING',
		'ROGUELIKE_DECKBUILDERS'
	];

	const PLATFORM_OPTIONS = ['PC', 'SWITCH', 'PLAYSTATION', 'XBOX'];

	const RETRO_OPTIONS = [
		'NES',
		'SNES',
		'N64',
		'GAMECUBE',
		'WII',
		'WII_U',
		'DS',
		'3DS',
		'PS1',
		'PS2',
		'PS3',
		'PSP',
		'PS_VITA',
		'XBOX',
		'XBOX_360',
		'SEGA_GENESIS_MEGADRIVE',
		'SEGA_DREAMCAST',
		'EMULATORS',
		'NONE'
	];

	const PC_POWER_OPTIONS = [
		{ value: 'POTATO', label: 'Potato (VNs/LNs, some indie titles)' },
		{ value: 'LOW', label: 'Low (Most indies)' },
		{ value: 'MID', label: 'Medium (Indies and some AAAs)' },
		{ value: 'HIGH', label: 'High (Can play all games)' }
	];

	const CHALLENGE_OPTIONS = [
		{ value: 'EASY', label: 'Easy' },
		{ value: 'NORMAL', label: 'Normal' },
		{ value: 'HARD', label: 'Hard' },
		{ value: 'VERY_HARD', label: 'Very Hard' },
		{ value: 'SURPRISE_ME', label: 'Surprise Me' }
	];

	const LENGTH_OPTIONS = [
		{ value: 'SHORT', label: 'Short (< 5 h)' },
		{ value: 'MEDIUM', label: 'Medium (5 – 20 h)' },
		{ value: 'LONG', label: 'Long (20 – 50+ h)' },
		{ value: 'ANYTHING', label: 'Anything' }
	];

	const GAME_PASS_OPTIONS = [
		{ value: 'CONSOLE', label: 'Console Game Pass' },
		{ value: 'PC', label: 'PC Game Pass' },
		{ value: 'ULTIMATE', label: 'Game Pass Ultimate' },
		{ value: 'NONE', label: 'I do not have Game Pass' }
	];
</script>

<svelte:head>
	<title>Settings | Anicord Events Server</title>
</svelte:head>

<div class="bg-base-100 text-base-content flex min-h-screen flex-col">
	<Navbar user={data.user} />

	<main class="px-4 py-8 sm:px-6 lg:px-8 flex-1">
		<div class="max-w-3xl space-y-6 mx-auto">
			<!-- Page header -->
			<div>
				<h1 class="text-2xl font-extrabold tracking-tight gap-2 flex items-center">
					<span class="icon-[tabler--settings] text-primary text-2xl"></span>
					Settings
				</h1>
				<p class="text-sm text-base-content/50 mt-1">Update your server application form.</p>
			</div>

			<!-- Success / error banners -->
			{#if form?.success}
				<div class="alert alert-success gap-2 rounded-xl">
					<span class="icon-[tabler--circle-check] text-lg"></span>
					<span>Form saved successfully!</span>
				</div>
			{/if}
			{#if form?.error}
				<div class="alert alert-error gap-2 rounded-xl">
					<span class="icon-[tabler--alert-triangle] text-lg"></span>
					<span>{form.error}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					saving = true;
					return async ({ update }) => {
						await update();
						saving = false;
					};
				}}
				class="space-y-5"
			>
				<!-- ── Anime & Manga ─────────────────────────────────────── -->
				<section
					class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
				>
					<div class="h-1 from-primary via-accent to-secondary bg-gradient-to-r"></div>
					<div class="p-6 space-y-5">
						<h2 class="font-bold gap-2 text-base flex items-center">
							<span class="icon-[tabler--device-tv] text-primary text-lg"></span>
							Anime & Manga
						</h2>

						<div class="sm:grid-cols-2 gap-4 grid grid-cols-1">
							<div class="space-y-1.5">
								<label
									for="repServer"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Representative Server
								</label>
								<input
									id="repServer"
									name="repServer"
									type="text"
									class="input input-bordered w-full"
									value={f.repServer ?? ''}
									placeholder="e.g. Frieren"
								/>
							</div>

							<div class="space-y-1.5">
								<label
									for="anilistUrl"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Anime/Manga Progress URL
								</label>
								<input
									id="anilistUrl"
									name="anilistUrl"
									type="url"
									class="input input-bordered w-full"
									value={f.anilistUrl ?? ''}
									placeholder="https://anilist.co/user/..."
								/>
							</div>

							<div class="space-y-1.5">
								<label
									for="preferredMedium"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Preferred Medium
								</label>
								<input
									id="preferredMedium"
									name="preferredMedium"
									type="text"
									class="input input-bordered w-full"
									value={f.preferredMedium ?? ''}
									placeholder="Anime, Manga, Both…"
								/>
							</div>

							<div class="space-y-1.5">
								<label
									for="acceptingMedium"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Accepting Medium
								</label>
								<input
									id="acceptingMedium"
									name="acceptingMedium"
									type="text"
									class="input input-bordered w-full"
									value={f.acceptingMedium ?? ''}
									placeholder="Anime, Manga, Both…"
								/>
							</div>

							<div class="space-y-1.5">
								<label
									for="preferredGenres"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Preferred Genres
								</label>
								<input
									id="preferredGenres"
									name="preferredGenres"
									type="text"
									class="input input-bordered w-full"
									value={f.preferredGenres ?? ''}
									placeholder="Action, Romance…"
								/>
							</div>

							<div class="space-y-1.5">
								<label
									for="bannedGenres"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Banned Genres
								</label>
								<input
									id="bannedGenres"
									name="bannedGenres"
									type="text"
									class="input input-bordered w-full"
									value={f.bannedGenres ?? ''}
									placeholder="Horror, Ecchi…"
								/>
							</div>
						</div>
					</div>
				</section>

				<!-- ── Gaming ────────────────────────────────────────────── -->
				<section
					class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
				>
					<div class="h-1 from-secondary via-info to-accent bg-gradient-to-r"></div>
					<div class="p-6 space-y-5">
						<h2 class="font-bold gap-2 text-base flex items-center">
							<span class="icon-[tabler--device-gamepad-2] text-secondary text-lg"></span>
							Gaming
						</h2>

						<div class="sm:grid-cols-2 gap-4 grid grid-cols-1">
							<div class="space-y-1.5">
								<label
									for="gameProfileUrl"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Game Profile URL
								</label>
								<input
									id="gameProfileUrl"
									name="gameProfileUrl"
									type="url"
									class="input input-bordered w-full"
									value={f.gameProfileUrl ?? ''}
									placeholder="Steam / PSN / Xbox profile"
								/>
							</div>

							<div class="space-y-1.5">
								<label
									for="pcPower"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									PC Power
								</label>
								<select id="pcPower" name="pcPower" class="select select-bordered w-full">
									<option value="">— not set —</option>
									{#each PC_POWER_OPTIONS as opt}
										<option value={opt.value} selected={f.pcPower === opt.value}>{opt.label}</option
										>
									{/each}
								</select>
							</div>

							<div class="space-y-1.5">
								<label
									for="hasXboxGamePass"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Xbox Game Pass
								</label>
								<select
									id="hasXboxGamePass"
									name="hasXboxGamePass"
									class="select select-bordered w-full"
								>
									<option value="">— not set —</option>
									{#each GAME_PASS_OPTIONS as opt}
										<option value={opt.value} selected={f.xboxGamePass === opt.value}
											>{opt.label}</option
										>
									{/each}
								</select>
							</div>

							<div class="space-y-1.5">
								<label
									for="challengeLevelPreference"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Challenge Level
								</label>
								<select
									id="challengeLevelPreference"
									name="challengeLevelPreference"
									class="select select-bordered w-full"
								>
									<option value="">— not set —</option>
									{#each CHALLENGE_OPTIONS as opt}
										<option value={opt.value} selected={f.challengeLevelPreference === opt.value}
											>{opt.label}</option
										>
									{/each}
								</select>
							</div>

							<div class="space-y-1.5 sm:col-span-2">
								<label
									for="gameLengthPreference"
									class="label text-xs text-base-content/60 tracking-wider uppercase"
								>
									Game Length Preference
								</label>
								<select
									id="gameLengthPreference"
									name="gameLengthPreference"
									class="select select-bordered w-full"
								>
									<option value="">— not set —</option>
									{#each LENGTH_OPTIONS as opt}
										<option value={opt.value} selected={f.gameLengthPreference === opt.value}
											>{opt.label}</option
										>
									{/each}
								</select>
							</div>
						</div>

						<!-- Preferred game genres -->
						<div class="space-y-2">
							<p class="text-xs text-base-content/60 tracking-wider uppercase">
								Preferred Game Genres
							</p>
							<div class="gap-2 flex flex-wrap">
								{#each GAME_GENRES as genre}
									<label
										class="gap-1.5 badge badge-lg flex cursor-pointer items-center {hasGenre(genre)
											? 'badge-primary badge-soft'
											: 'badge-ghost'} hover:badge-primary hover:badge-soft transition-colors"
									>
										<input
											type="checkbox"
											name="preferredGameGenres"
											value={genre}
											checked={hasGenre(genre)}
											class="hidden"
										/>
										{genre.replace('_', ' ')}
									</label>
								{/each}
							</div>
						</div>
					</div>
				</section>

				<!-- ── Event Participation ───────────────────────────────── -->
				<section
					class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
				>
					<div class="h-1 from-accent via-warning to-primary bg-gradient-to-r"></div>
					<div class="p-6 space-y-4">
						<h2 class="font-bold gap-2 text-base flex items-center">
							<span class="icon-[tabler--calendar-event] text-accent text-lg"></span>
							Event Participation
						</h2>

						<div class="sm:grid-cols-2 gap-3 grid grid-cols-1">
							{#each [{ name: 'extremeSpecialParticipation', label: 'Extreme Special', icon: 'icon-[tabler--flame]' }, { name: 'sponsorParticipation', label: 'Sponsor', icon: 'icon-[tabler--star]' }, { name: 'aidParadeParticipation', label: 'Aid Parade', icon: 'icon-[tabler--confetti]' }, { name: 'competitiveBlitzParticipation', label: 'Competitive Blitz', icon: 'icon-[tabler--swords]' }, { name: 'casualBlitzParticipation', label: 'Casual Blitz', icon: 'icon-[tabler--wind]' }, { name: 'bookClubParticipation', label: 'Book Club', icon: 'icon-[tabler--book]' }, { name: 'gameClubParticipation', label: 'Game Club', icon: 'icon-[tabler--device-gamepad]' }] as event}
								<label
									class="gap-3 p-3 rounded-xl bg-base-300/40 hover:bg-base-300/70 group flex cursor-pointer items-center transition-colors"
								>
									<input
										type="checkbox"
										name={event.name}
										checked={f[event.name] ?? false}
										class="checkbox checkbox-primary"
									/>
									<span
										class="{event.icon} text-base text-base-content/50 group-hover:text-primary transition-colors"
									></span>
									<span class="text-sm font-medium">{event.label}</span>
								</label>
							{/each}
						</div>
					</div>
				</section>

				<!-- ── Notes ────────────────────────────────────────────── -->
				<section
					class="rounded-2xl border-base-300/50 bg-base-200/60 backdrop-blur-sm overflow-hidden border"
				>
					<div class="h-1 from-info via-secondary to-neutral bg-gradient-to-r"></div>
					<div class="p-6 space-y-4">
						<h2 class="font-bold gap-2 text-base flex items-center">
							<span class="icon-[tabler--note] text-info text-lg"></span>
							Notes
						</h2>

						<div class="space-y-1.5">
							<label
								for="notesForStaff"
								class="label text-xs text-base-content/60 tracking-wider uppercase"
							>
								Notes for Staff
							</label>
							<textarea
								id="notesForStaff"
								name="notesForStaff"
								rows="3"
								class="textarea textarea-bordered w-full resize-none"
								placeholder="Anything the staff should know…">{f.notesForStaff ?? ''}</textarea
							>
						</div>

						<div class="space-y-1.5">
							<label
								for="notesForContractor"
								class="label text-xs text-base-content/60 tracking-wider uppercase"
							>
								Notes for Contractor
							</label>
							<textarea
								id="notesForContractor"
								name="notesForContractor"
								rows="3"
								class="textarea textarea-bordered w-full resize-none"
								placeholder="Anything your contractor should know…"
								>{f.notesForContractor ?? ''}</textarea
							>
						</div>
					</div>
				</section>

				<!-- Save button -->
				<div class="pb-6 flex justify-end">
					<button type="submit" disabled={saving} class="btn btn-primary gap-2 px-8">
						{#if saving}
							<span class="loading loading-spinner loading-sm"></span>
							Saving…
						{:else}
							<span class="icon-[tabler--device-floppy] text-base"></span>
							Save Changes
						{/if}
					</button>
				</div>
			</form>
		</div>
	</main>

	<Footer />
</div>
