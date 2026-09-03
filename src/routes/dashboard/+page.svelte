<script lang="ts">
	import { enhance } from '$app/forms';
	import Footer from '$lib/components/Footer.svelte';

	let { data, form } = $props();

	const user = $derived(data.user);
	const season = $derived(data.currentSeason);
	const contractTypes = $derived(data.contractTypes ?? []);
	const signedUp = $derived(data.signedUp);
	const signupForm = $derived(data.signupForm ?? {});
	const contracts = $derived(data.contracts ?? []);
	const contracteeForms = $derived(data.contracteeForms ?? {});

	let submitting = $state(false);
	let activeTab = $state<'overview' | 'my-contract' | 'assigned-to-others'>('overview');

	// Current date for phase calculations
	const now = new Date();

	// Timeline checks
	const signupsStart = $derived(season?.signupsStart ? new Date(season.signupsStart) : null);
	const signupsEnd = $derived(season?.signupsEnd ? new Date(season.signupsEnd) : null);

	const isSignupsOpen = $derived(
		Boolean(season && !season.completed && signupsStart && signupsEnd && now >= signupsStart && now <= signupsEnd)
	);

	const isSignupsPast = $derived(
		Boolean(season && signupsEnd && now > signupsEnd)
	);

	// Find earliest assignment start and latest review deadline across contract types
	const assignmentDates = $derived(() => {
		if (!contractTypes.length) return null;
		const starts = contractTypes.map((t: any) => new Date(t.assignmentStart).getTime());
		const ends = contractTypes.map((t: any) => new Date(t.assignmentEnd).getTime());
		const deadlines = contractTypes.map((t: any) => new Date(t.reviewDeadline).getTime());
		return {
			start: new Date(Math.min(...starts)),
			end: new Date(Math.max(...ends)),
			deadline: new Date(Math.max(...deadlines))
		};
	});

	// Split user's contracts
	const receivedContracts = $derived(
		contracts.filter((c: any) => c.contractee?.id === user?.id)
	);
	const givenContracts = $derived(
		contracts.filter((c: any) => c.contractor?.id === user?.id)
	);

	function formatDate(d: string | Date | null | undefined): string {
		if (!d) return '—';
		const date = typeof d === 'string' ? new Date(d) : d;
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function checkBansMatch(inputTitle: string, bannedGenresStr: string): string[] {
		if (!inputTitle || !bannedGenresStr) return [];
		const bans = bannedGenresStr
			.split(/[,;\n]+/)
			.map((b) => b.trim().toLowerCase())
			.filter(Boolean);
		const lowerTitle = inputTitle.toLowerCase();
		return bans.filter((ban) => lowerTitle.includes(ban));
	}

	function getVerdictBadge(verdict: string) {
		switch (verdict) {
			case 'PASS':
				return { class: 'badge-success text-success-content', label: 'PASS' };
			case 'LATE_PASS':
				return { class: 'badge-warning text-warning-content', label: 'LATE PASS' };
			case 'FAIL':
				return { class: 'badge-error text-error-content', label: 'FAIL' };
			default:
				return { class: 'badge-neutral text-neutral-content', label: 'PENDING' };
		}
	}
</script>

<svelte:head>
	<title>Dashboard | Anicord Events Server</title>
</svelte:head>

<div class="bg-base-100 text-base-content flex min-h-screen flex-col">
	<main class="px-4 py-8 sm:px-6 lg:px-8 flex-1">
		<div class="max-w-5xl space-y-6 mx-auto">
			<!-- Header Banner -->
			<div
				class="rounded-3xl border-base-300/60 bg-gradient-to-br from-base-200/80 via-base-200/40 to-base-300/40 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden border shadow-xl"
			>
				<div
					class="w-64 h-64 bg-primary/10 rounded-full blur-3xl -top-12 -right-12 pointer-events-none absolute"
				></div>
				<div
					class="w-64 h-64 bg-secondary/10 rounded-full blur-3xl -bottom-12 -left-12 pointer-events-none absolute"
				></div>

				<div class="sm:flex-row sm:items-center justify-between gap-4 relative z-10 flex flex-col">
					<div class="gap-4 flex items-center">
						<img
							src={user?.avatarUrl}
							alt={user?.username}
							class="h-16 w-16 ring-primary/40 rounded-2xl shadow-md object-cover ring-2"
						/>
						<div>
							<div class="gap-2 flex flex-wrap items-center">
								<h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">
									Hello, {user?.username}
								</h1>
								{#if user?.roles?.includes('admin')}
									<span class="badge badge-accent badge-sm font-semibold">ADMIN</span>
								{/if}
							</div>
							<p class="text-sm text-base-content/60 mt-1">
								{#if season}
									Active Season: <span class="text-primary font-semibold">{season.name}</span>
								{:else}
									No active season currently running
								{/if}
							</p>
						</div>
					</div>

					<!-- Season Status Badge -->
					<div>
						{#if !season}
							<div class="badge badge-soft badge-neutral badge-lg gap-2 py-3 px-4">
								<span class="w-2 h-2 rounded-full bg-base-content/40 inline-block"></span>
								<span>Off Season</span>
							</div>
						{:else if season.completed}
							<div class="badge badge-soft badge-info badge-lg gap-2 py-3 px-4">
								<span class="w-2 h-2 rounded-full bg-info inline-block"></span>
								<span>Season Completed</span>
							</div>
						{:else if isSignupsOpen}
							<div class="badge badge-soft badge-success badge-lg gap-2 py-3 px-4">
								<span class="w-2 h-2 rounded-full bg-success animate-pulse inline-block"></span>
								<span>Signups Open</span>
							</div>
						{:else if isSignupsPast && contracts.length > 0}
							<div class="badge badge-soft badge-primary badge-lg gap-2 py-3 px-4">
								<span class="w-2 h-2 rounded-full bg-primary inline-block"></span>
								<span>In Season</span>
							</div>
						{:else}
							<div class="badge badge-soft badge-warning badge-lg gap-2 py-3 px-4">
								<span class="w-2 h-2 rounded-full bg-warning inline-block"></span>
								<span>Matchmaking in Progress</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Success & Error Banners -->
			{#if form?.message}
				<div class="alert alert-success gap-2 rounded-2xl shadow-md">
					<span class="icon-[tabler--circle-check] text-xl"></span>
					<span>{form.message}</span>
				</div>
			{/if}
			{#if form?.error}
				<div class="alert alert-error gap-2 rounded-2xl shadow-md">
					<span class="icon-[tabler--alert-triangle] text-xl"></span>
					<span>{form.error}</span>
				</div>
			{/if}

			<!-- Navigation Tabs for Dashboard -->
			{#if season && (contracts.length > 0 || isSignupsPast)}
				<div class="flex gap-2 border-b border-base-300 pb-2">
					<button
						type="button"
						class="btn btn-sm {activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}"
						onclick={() => (activeTab = 'overview')}
					>
						<span class="icon-[tabler--info-circle]"></span>
						Season Overview
					</button>
					<button
						type="button"
						class="btn btn-sm {activeTab === 'my-contract' ? 'btn-primary' : 'btn-ghost'}"
						onclick={() => (activeTab = 'my-contract')}
					>
						<span class="icon-[tabler--target]"></span>
						My Contract ({receivedContracts.length})
					</button>
					<button
						type="button"
						class="btn btn-sm {activeTab === 'assigned-to-others' ? 'btn-primary' : 'btn-ghost'}"
						onclick={() => (activeTab = 'assigned-to-others')}
					>
						<span class="icon-[tabler--gift]"></span>
						Assigned to Others ({givenContracts.length})
					</button>
				</div>
			{/if}

			<!-- ========================================================= -->
			<!-- STATE 1: NO ACTIVE SEASON -->
			<!-- ========================================================= -->
			{#if !season}
				<div
					class="p-10 text-center rounded-3xl border border-base-300 bg-base-200/40 backdrop-blur-sm space-y-4"
				>
					<div
						class="w-16 h-16 rounded-2xl bg-base-300/60 text-primary mx-auto flex items-center justify-center text-3xl"
					>
						<span class="icon-[tabler--calendar-off]"></span>
					</div>
					<h2 class="text-xl font-bold">There is no active season right now</h2>
					<p class="text-base-content/60 max-w-md mx-auto text-sm">
						Contract events take place in scheduled seasons. While waiting, make sure your signup
						preferences and ban list are configured!
					</p>
					<div class="pt-2">
						<a href="/settings/form" class="btn btn-primary btn-sm gap-2">
							<span class="icon-[tabler--adjustments]"></span>
							Configure My Preferences
						</a>
					</div>
				</div>

			<!-- ========================================================= -->
			<!-- STATE 2: SIGNUPS OPEN -->
			<!-- ========================================================= -->
			{:else if isSignupsOpen && activeTab === 'overview'}
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<!-- Signup Action Card -->
					<div
						class="lg:col-span-2 rounded-3xl border border-base-300 bg-base-200/50 p-6 sm:p-8 space-y-6 backdrop-blur-sm"
					>
						<div class="flex items-start justify-between gap-4">
							<div>
								<span class="text-xs uppercase tracking-wider text-primary font-bold">
									Signups Phase
								</span>
								<h2 class="text-2xl font-bold mt-1">{season.name}</h2>
								<p class="text-sm text-base-content/60 mt-1">
									Signups close on {formatDate(season.signupsEnd)}.
								</p>
							</div>
							<div
								class="p-3 rounded-2xl {signedUp
									? 'bg-success/20 text-success'
									: 'bg-base-300/60 text-base-content/50'}"
							>
								<span
									class="icon-[tabler--{signedUp
										? 'circle-check'
										: 'user-plus'}] text-2xl"
								></span>
							</div>
						</div>

						<div class="p-4 rounded-2xl bg-base-300/40 border border-base-300/60 space-y-3">
							<h3 class="text-sm font-semibold flex items-center gap-2">
								<span class="icon-[tabler--info-square-rounded] text-primary"></span>
								How this event works
							</h3>
							<ul class="text-xs text-base-content/70 space-y-1.5 list-disc list-inside">
								<li>Sign up before the deadline.</li>
								<li>You will be paired with a random contractee to assign a contract to.</li>
								<li>Someone else will assign you a contract based on your preferences.</li>
								<li>Complete your contract, rate it, and submit your review URL before the deadline!</li>
							</ul>
						</div>

						<!-- Sign up / Withdraw Form -->
						<div class="pt-2 flex flex-wrap gap-4 items-center justify-between">
							{#if signedUp}
								<div class="flex items-center gap-2 text-success font-medium text-sm">
									<span class="icon-[tabler--check] text-lg"></span>
									<span>You are registered for this season!</span>
								</div>
								<form
									method="POST"
									action="?/withdraw"
									use:enhance={() => {
										submitting = true;
										return async ({ update }) => {
											await update();
											submitting = false;
										};
									}}
								>
									<input type="hidden" name="seasonId" value={season.id} />
									<button
										type="submit"
										disabled={submitting}
										class="btn btn-outline btn-error btn-sm gap-2"
									>
										{#if submitting}
											<span class="loading loading-spinner loading-xs"></span>
										{:else}
											<span class="icon-[tabler--user-x]"></span>
										{/if}
										Withdraw from Season
									</button>
								</form>
							{:else}
								<div class="text-sm text-base-content/60">
									Ready to join? Click the button to register your entry.
								</div>
								<form
									method="POST"
									action="?/signup"
									use:enhance={() => {
										submitting = true;
										return async ({ update }) => {
											await update();
											submitting = false;
										};
									}}
								>
									<input type="hidden" name="seasonId" value={season.id} />
									<button
										type="submit"
										disabled={submitting}
										class="btn btn-primary btn-md gap-2 px-6"
									>
										{#if submitting}
											<span class="loading loading-spinner loading-sm"></span>
										{:else}
											<span class="icon-[tabler--sparkles]"></span>
										{/if}
										Sign Up for Season
									</button>
								</form>
							{/if}
						</div>
					</div>

					<!-- User Preferences Quick View -->
					<div
						class="rounded-3xl border border-base-300 bg-base-200/50 p-6 space-y-4 backdrop-blur-sm flex flex-col justify-between"
					>
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="font-bold text-sm uppercase tracking-wider text-base-content/70">
									My Preferences
								</h3>
								<a href="/settings/form" class="btn btn-ghost btn-xs text-primary gap-1">
									<span class="icon-[tabler--edit]"></span> Edit
								</a>
							</div>

							<div class="space-y-3 text-xs">
								<div class="bg-base-300/40 p-3 rounded-xl">
									<span class="text-base-content/50 block mb-0.5">Representative Server:</span>
									<span class="font-semibold">{signupForm.repServer || 'Not selected'}</span>
								</div>

								<div class="bg-base-300/40 p-3 rounded-xl">
									<span class="text-base-content/50 block mb-0.5">Preferred Medium:</span>
									<span class="font-semibold">{signupForm.preferredMedium || 'Any'}</span>
								</div>

								<div class="bg-base-300/40 p-3 rounded-xl">
									<span class="text-base-content/50 block mb-0.5 text-error">Banned Genres / Types:</span>
									<span class="font-semibold text-error">
										{signupForm.bannedGenres || 'None specified'}
									</span>
								</div>
							</div>
						</div>

						<p class="text-[11px] text-base-content/40 italic">
							Contractors assigned to you will consult these preferences when choosing your contract.
						</p>
					</div>
				</div>

			<!-- ========================================================= -->
			<!-- STATE 3: OVERVIEW TAB (IN SEASON / MATCHMAKING) -->
			<!-- ========================================================= -->
			{:else if activeTab === 'overview'}
				<div class="space-y-6">
					<!-- Season Timeline Card -->
					<div class="rounded-3xl border border-base-300 bg-base-200/50 p-6 backdrop-blur-sm space-y-4">
						<h2 class="text-lg font-bold flex items-center gap-2">
							<span class="icon-[tabler--calendar-time] text-primary"></span>
							Season Timeline & Categories
						</h2>

						<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
							<div class="bg-base-300/40 p-4 rounded-2xl border border-base-300/50 space-y-1">
								<span class="text-base-content/50 block">Signups Period</span>
								<span class="font-semibold text-sm">
									{formatDate(season.signupsStart)} — {formatDate(season.signupsEnd)}
								</span>
							</div>

							{#if assignmentDates()}
								<div class="bg-base-300/40 p-4 rounded-2xl border border-base-300/50 space-y-1">
									<span class="text-base-content/50 block">Assignment Window</span>
									<span class="font-semibold text-sm">
										{formatDate(assignmentDates()?.start)} — {formatDate(assignmentDates()?.end)}
									</span>
								</div>
								<div class="bg-base-300/40 p-4 rounded-2xl border border-base-300/50 space-y-1">
									<span class="text-base-content/50 block">Review Deadline</span>
									<span class="font-semibold text-sm text-warning">
										{formatDate(assignmentDates()?.deadline)}
									</span>
								</div>
							{/if}
						</div>

						<!-- Contract Types List -->
						{#if contractTypes.length > 0}
							<div class="pt-2">
								<h3 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
									Active Contract Types
								</h3>
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{#each contractTypes as ct}
										<div
											class="p-3 rounded-2xl bg-base-300/30 border border-base-300/60 flex items-center justify-between"
										>
											<div class="flex items-center gap-2.5">
												<div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
													<span class="icon-[tabler--{ct.icon || 'star'}] text-lg"></span>
												</div>
												<div>
													<span class="font-semibold text-xs block">{ct.name}</span>
													<span class="text-[11px] text-base-content/50">Slug: {ct.slug}</span>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Quick Summary of User's Contracts -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div
							class="p-6 rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm space-y-4"
						>
							<div class="flex items-center justify-between">
								<h3 class="font-bold flex items-center gap-2">
									<span class="icon-[tabler--target] text-secondary"></span>
									Contracts Given to You
								</h3>
								<button
									type="button"
									class="btn btn-ghost btn-xs text-primary"
									onclick={() => (activeTab = 'my-contract')}
								>
									View Details &rarr;
								</button>
							</div>
							{#if receivedContracts.length === 0}
								<p class="text-xs text-base-content/50 italic">
									No contracts assigned to you yet. Matchmaking may still be running!
								</p>
							{:else}
								<div class="space-y-2">
									{#each receivedContracts as rc}
										<div class="p-3 rounded-xl bg-base-300/40 flex items-center justify-between text-xs">
											<div>
												<span class="font-bold block text-sm">
													{rc.name || '(Waiting for contractor to assign title)'}
												</span>
												<span class="text-base-content/60">
													From: {rc.contractor?.username} &bull; {rc.contractType?.name}
												</span>
											</div>
											<span class="badge {getVerdictBadge(rc.verdict).class} badge-sm">
												{getVerdictBadge(rc.verdict).label}
											</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<div
							class="p-6 rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm space-y-4"
						>
							<div class="flex items-center justify-between">
								<h3 class="font-bold flex items-center gap-2">
									<span class="icon-[tabler--gift] text-accent"></span>
									Contracts You Must Assign
								</h3>
								<button
									type="button"
									class="btn btn-ghost btn-xs text-primary"
									onclick={() => (activeTab = 'assigned-to-others')}
								>
									View Details &rarr;
								</button>
							</div>
							{#if givenContracts.length === 0}
								<p class="text-xs text-base-content/50 italic">
									You have not been assigned any contractees yet.
								</p>
							{:else}
								<div class="space-y-2">
									{#each givenContracts as gc}
										<div class="p-3 rounded-xl bg-base-300/40 flex items-center justify-between text-xs">
											<div>
												<span class="font-bold block text-sm">
													{gc.name || '(Not assigned yet)'}
												</span>
												<span class="text-base-content/60">
													To: {gc.contractee?.username} &bull; {gc.contractType?.name}
												</span>
											</div>
											<span class="badge {gc.name ? 'badge-success' : 'badge-warning'} badge-sm">
												{gc.name ? 'Assigned' : 'Needs Assignment'}
											</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>

			<!-- ========================================================= -->
			<!-- STATE 4: MY CONTRACT TAB (CONTRACTEE VIEW) -->
			<!-- ========================================================= -->
			{:else if activeTab === 'my-contract'}
				<div class="space-y-6">
					{#if receivedContracts.length === 0}
						<div class="p-8 text-center rounded-3xl border border-base-300 bg-base-200/40">
							<span class="icon-[tabler--clock] text-3xl text-base-content/40 mb-2"></span>
							<h3 class="font-bold text-lg">No Contract Assigned Yet</h3>
							<p class="text-sm text-base-content/60 mt-1">
								Staff has not finalized the contract pairings yet or matchmaking is in progress.
							</p>
						</div>
					{:else}
						{#each receivedContracts as contract}
							<div
								class="rounded-3xl border border-base-300 bg-base-200/50 p-6 sm:p-8 backdrop-blur-sm space-y-6"
							>
								<!-- Top Bar -->
								<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300/60 pb-6">
									<div>
										<div class="flex items-center gap-2">
											<span class="badge badge-primary badge-sm font-semibold">
												{contract.contractType?.name || 'Contract'}
											</span>
											<span class="badge {getVerdictBadge(contract.verdict).class} badge-sm">
												{getVerdictBadge(contract.verdict).label}
											</span>
										</div>
										<h2 class="text-2xl font-black mt-2 tracking-tight">
											{contract.name || 'Title Pending Assignment'}
										</h2>
										<p class="text-xs text-base-content/60 mt-1">
											Assigned by contractor: <span class="font-semibold text-base-content">{contract.contractor?.username}</span>
										</p>
									</div>

									{#if contract.contractType?.reviewDeadline}
										<div class="p-3 rounded-2xl bg-base-300/60 border border-base-300/70 text-right">
											<span class="text-[11px] text-base-content/50 block">Review Deadline</span>
											<span class="text-xs font-bold text-warning">
												{formatDate(contract.contractType.reviewDeadline)}
											</span>
										</div>
									{/if}
								</div>

								{#if !contract.name}
									<div class="alert alert-warning gap-2 rounded-2xl">
										<span class="icon-[tabler--hourglass-empty] text-xl"></span>
										<div>
											<span class="font-bold block">Waiting for Assignment</span>
											<span class="text-xs">
												Your contractor ({contract.contractor?.username}) is currently selecting a title for you.
											</span>
										</div>
									</div>
								{:else}
									<!-- Progress & Review Submission Form -->
									<form
										method="POST"
										action="?/updateReview"
										use:enhance={() => {
											submitting = true;
											return async ({ update }) => {
												await update();
												submitting = false;
											};
										}}
										class="space-y-5"
									>
										<input type="hidden" name="seasonId" value={season.id} />
										<input type="hidden" name="contractId" value={contract.id} />

										<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<!-- Progress tracker -->
											<div class="space-y-1.5">
												<label
													for="progress-{contract.id}"
													class="label text-xs uppercase tracking-wider text-base-content/60"
												>
													Current Progress / Status
												</label>
												<input
													id="progress-{contract.id}"
													name="progress"
													type="text"
													class="input input-bordered w-full"
													value={contract.progress ?? ''}
													placeholder="e.g. Planning, Chapter 12, Finished"
													disabled={contract.verdict !== 'PENDING'}
												/>
											</div>

											<!-- Score -->
											<div class="space-y-1.5">
												<label
													for="score-{contract.id}"
													class="label text-xs uppercase tracking-wider text-base-content/60"
												>
													Score / Rating
												</label>
												<input
													id="score-{contract.id}"
													name="score"
													type="text"
													class="input input-bordered w-full"
													value={contract.score ?? ''}
													placeholder="e.g. 8.5/10, 85/100, 11/10, -5/10"
													disabled={contract.verdict !== 'PENDING'}
												/>
											</div>
										</div>

										<!-- Review content / link -->
										<div class="space-y-1.5">
											<label
												for="reviewContent-{contract.id}"
												class="label text-xs uppercase tracking-wider text-base-content/60"
											>
												Review URL or Review Content
											</label>
											<textarea
												id="reviewContent-{contract.id}"
												name="reviewContent"
												rows="3"
												class="textarea textarea-bordered w-full resize-none"
												placeholder="Paste your AniList/MAL review URL, blog link, or written review here..."
												disabled={contract.verdict !== 'PENDING'}>{contract.reviewContent ?? ''}</textarea
											>
										</div>

										<!-- Actions -->
										{#if contract.verdict === 'PENDING'}
											<div class="flex justify-end pt-2">
												<button
													type="submit"
													disabled={submitting}
													class="btn btn-primary btn-md gap-2 px-6"
												>
													{#if submitting}
														<span class="loading loading-spinner loading-xs"></span>
													{:else}
														<span class="icon-[tabler--device-floppy]"></span>
													{/if}
													Save Review & Progress
												</button>
											</div>
										{:else}
											<div class="alert alert-info gap-2 rounded-xl text-xs">
												<span class="icon-[tabler--lock] text-lg"></span>
												<span>This contract has already been graded ({contract.verdict}) and can no longer be edited.</span>
											</div>
										{/if}
									</form>
								{/if}
							</div>
						{/each}
					{/if}
				</div>

			<!-- ========================================================= -->
			<!-- STATE 5: ASSIGNED TO OTHERS (CONTRACTOR VIEW) -->
			<!-- ========================================================= -->
			{:else if activeTab === 'assigned-to-others'}
				<div class="space-y-6">
					{#if givenContracts.length === 0}
						<div class="p-8 text-center rounded-3xl border border-base-300 bg-base-200/40">
							<span class="icon-[tabler--users] text-3xl text-base-content/40 mb-2"></span>
							<h3 class="font-bold text-lg">No Contractees Assigned Yet</h3>
							<p class="text-sm text-base-content/60 mt-1">
								When matchmaking is completed, the participant you must assign a contract to will appear here.
							</p>
						</div>
					{:else}
						{#each givenContracts as contract}
							{@const cForm = contracteeForms[contract.contractee?.id] ?? {}}
							{@const bansMatch = checkBansMatch(contract.name, cForm.bannedGenres ?? '')}

							<div
								class="rounded-3xl border border-base-300 bg-base-200/50 p-6 sm:p-8 backdrop-blur-sm space-y-6"
							>
								<!-- Contractee Info -->
								<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-base-300/60 pb-6">
									<div class="flex items-center gap-4">
										<img
											src={contract.contractee?.avatarUrl}
											alt={contract.contractee?.username}
											class="w-14 h-14 rounded-2xl ring-2 ring-primary/30 object-cover"
										/>
										<div>
											<span class="text-xs uppercase tracking-wider text-primary font-bold">
												Your Contractee
											</span>
											<h2 class="text-xl font-bold">{contract.contractee?.username}</h2>
											<p class="text-xs text-base-content/60 mt-0.5">
												Server: <span class="font-medium text-base-content">{cForm.repServer || 'Unknown'}</span>
												{#if cForm.anilistUrl}
													&bull;
													<a
														href={cForm.anilistUrl}
														target="_blank"
														rel="noopener noreferrer"
														class="link link-primary inline-flex items-center gap-0.5"
													>
														Anime Profile
														<span class="icon-[tabler--external-link] text-xs"></span>
													</a>
												{/if}
											</p>
										</div>
									</div>

									<span class="badge badge-soft badge-primary badge-sm">
										{contract.contractType?.name}
									</span>
								</div>

								<!-- Contractee Preferences & BANS Warning -->
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="p-4 rounded-2xl bg-base-300/30 border border-base-300/50 space-y-2 text-xs">
										<h4 class="font-bold text-base-content/70 flex items-center gap-1.5">
											<span class="icon-[tabler--heart] text-secondary"></span>
											Contractee Preferences
										</h4>
										<p><span class="text-base-content/50">Preferred Medium:</span> {cForm.preferredMedium || 'Any'}</p>
										<p><span class="text-base-content/50">Preferred Genres:</span> {cForm.preferredGenres || 'Any'}</p>
										{#if cForm.notesForContractor}
											<div class="mt-2 pt-2 border-t border-base-300/60">
												<span class="text-base-content/50 block mb-0.5">Note from Contractee:</span>
												<span class="italic text-base-content/80 font-serif">"{cForm.notesForContractor}"</span>
											</div>
										{/if}
									</div>

									<div class="p-4 rounded-2xl bg-error/10 border border-error/20 space-y-2 text-xs">
										<h4 class="font-bold text-error flex items-center gap-1.5">
											<span class="icon-[tabler--ban] text-error"></span>
											Banned Genres / Mediums (MANDATORY)
										</h4>
										<p class="text-error font-semibold text-sm">
											{cForm.bannedGenres || 'None specified'}
										</p>
										<p class="text-[11px] text-base-content/50">
											Please make sure the contract you assign does NOT violate these bans.
										</p>
									</div>
								</div>

								<!-- Contract Assignment Form -->
								<form
									method="POST"
									action="?/assignContract"
									use:enhance={() => {
										submitting = true;
										return async ({ update }) => {
											await update();
											submitting = false;
										};
									}}
									class="space-y-4 pt-2"
								>
									<input type="hidden" name="seasonId" value={season.id} />
									<input type="hidden" name="contractId" value={contract.id} />

									<div class="space-y-1.5">
										<label
											for="name-{contract.id}"
											class="label text-xs uppercase tracking-wider text-base-content/60"
										>
											Contract Title (Anime, Manga, Game, etc.)
										</label>
										<div class="flex gap-3">
											<input
												id="name-{contract.id}"
												name="name"
												type="text"
												class="input input-bordered flex-1"
												value={contract.name ?? ''}
												placeholder="e.g. Frieren: Beyond Journey's End, NieR: Automata..."
											/>
											<button
												type="submit"
												disabled={submitting}
												class="btn btn-primary gap-2"
											>
												{#if submitting}
													<span class="loading loading-spinner loading-xs"></span>
												{:else}
													<span class="icon-[tabler--check]"></span>
												{/if}
												Assign Title
											</button>
										</div>
									</div>
								</form>

								<!-- Status of the contractee's progress -->
								<div class="p-4 rounded-2xl bg-base-300/40 border border-base-300/60 flex flex-wrap items-center justify-between gap-4 text-xs">
									<div class="space-y-0.5">
										<span class="text-base-content/50 block">Contractee Progress:</span>
										<span class="font-semibold text-sm">{contract.progress || 'Not started'}</span>
									</div>
									<div class="space-y-0.5">
										<span class="text-base-content/50 block">Score:</span>
										<span class="font-semibold text-sm">{contract.score || 'Not rated yet'}</span>
									</div>
									{#if contract.reviewContent}
										<div class="space-y-0.5">
											<span class="text-base-content/50 block">Review Link / Content:</span>
											{#if contract.reviewContent.startsWith('http')}
												<a
													href={contract.reviewContent}
													target="_blank"
													rel="noopener noreferrer"
													class="link link-primary font-medium inline-flex items-center gap-1"
												>
													View Submitted Review
													<span class="icon-[tabler--external-link] text-xs"></span>
												</a>
											{:else}
												<span class="font-medium truncate max-w-xs block">{contract.reviewContent}</span>
											{/if}
										</div>
									{/if}
									<span class="badge {getVerdictBadge(contract.verdict).class} badge-sm">
										Verdict: {getVerdictBadge(contract.verdict).label}
									</span>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	</main>
	<Footer />
</div>
