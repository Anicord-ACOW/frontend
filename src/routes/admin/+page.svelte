<script lang="ts">
	import { enhance } from '$app/forms';
	import Footer from '$lib/components/Footer.svelte';

	let { data, form } = $props();

	const user = $derived(data.user);
	const seasons = $derived(data.seasons ?? []);
	const season = $derived(data.currentSeason);
	const contractTypes = $derived(data.contractTypes ?? []);
	const signups = $derived(data.signups ?? []);
	const contracts = $derived(data.contracts ?? []);
	const userForms = $derived(data.userForms ?? {});

	let activeTab = $state<'moderation' | 'matchmaking' | 'participants' | 'seasons'>('moderation');
	let moderationFilter = $state<'all' | 'needs-grading' | 'graded' | 'incomplete'>('all');
	let submitting = $state(false);

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

	function toDatetimeLocal(d: Date | null = null): string {
		const target = d ? new Date(d) : new Date(Date.now() + 3600000);
		target.setMinutes(target.getMinutes() - target.getTimezoneOffset());
		return target.toISOString().slice(0, 16);
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

	const filteredContracts = $derived(
		contracts.filter((c: any) => {
			if (moderationFilter === 'needs-grading') {
				return c.verdict === 'PENDING' && (Boolean(c.reviewContent) || Boolean(c.score));
			}
			if (moderationFilter === 'graded') {
				return c.verdict !== 'PENDING';
			}
			if (moderationFilter === 'incomplete') {
				return c.verdict === 'PENDING' && !c.reviewContent && !c.score;
			}
			return true;
		})
	);
</script>

<svelte:head>
	<title>Admin Panel | Anicord Events Server</title>
</svelte:head>

<div class="bg-base-100 text-base-content flex min-h-screen flex-col">
	<main class="px-4 py-8 sm:px-6 lg:px-8 flex-1">
		<div class="max-w-6xl space-y-6 mx-auto">
			<!-- Header -->
			<div
				class="rounded-3xl border-base-300/60 bg-gradient-to-br from-base-200/90 via-base-200/50 to-base-300/50 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden border shadow-xl"
			>
				<div class="sm:flex-row sm:items-center justify-between gap-4 relative z-10 flex flex-col">
					<div>
						<div class="flex items-center gap-2">
							<span class="icon-[tabler--shield-lock] text-accent text-2xl"></span>
							<span class="badge badge-accent badge-sm font-semibold uppercase">Moderator Control Center</span>
						</div>
						<h1 class="text-2xl font-black tracking-tight sm:text-3xl mt-1">
							Seasons & Contracts Administration
						</h1>
						<p class="text-sm text-base-content/60 mt-1">
							Manage season schedules, run matchmaking derangements, and moderate/grade user reviews.
						</p>
					</div>

					<!-- Season Selector Switcher -->
					{#if seasons.length > 0}
						<div class="flex items-center gap-2 bg-base-300/60 p-2 rounded-2xl border border-base-300">
							<label for="season-select" class="text-xs font-semibold text-base-content/60 pl-2">
								Season:
							</label>
							<select
								id="season-select"
								class="select select-sm select-bordered"
								value={season?.id?.toString()}
								onchange={(e) => {
									const targetId = (e.target as HTMLSelectElement).value;
									window.location.href = `/admin?seasonId=${targetId}`;
								}}
							>
								{#each seasons as s}
									<option value={s.id.toString()}>
										{s.name} {s.completed ? '(Completed)' : '(Active)'}
									</option>
								{/each}
							</select>
						</div>
					{/if}
				</div>
			</div>

			<!-- Success & Error Alerts -->
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

			<!-- Navigation Tabs -->
			<div class="flex flex-wrap gap-2 border-b border-base-300 pb-2">
				<button
					type="button"
					class="btn btn-sm {activeTab === 'moderation' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => (activeTab = 'moderation')}
				>
					<span class="icon-[tabler--gavel]"></span>
					Review Moderation & Grading ({contracts.filter((c: any) => c.verdict === 'PENDING' && (c.reviewContent || c.score)).length})
				</button>
				<button
					type="button"
					class="btn btn-sm {activeTab === 'matchmaking' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => (activeTab = 'matchmaking')}
				>
					<span class="icon-[tabler--arrows-shuffle]"></span>
					Matchmaking & Contracts ({contracts.length})
				</button>
				<button
					type="button"
					class="btn btn-sm {activeTab === 'participants' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => (activeTab = 'participants')}
				>
					<span class="icon-[tabler--users]"></span>
					Participants ({signups.length})
				</button>
				<button
					type="button"
					class="btn btn-sm {activeTab === 'seasons' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => (activeTab = 'seasons')}
				>
					<span class="icon-[tabler--calendar-cog]"></span>
					Seasons & Types
				</button>
			</div>

			<!-- ========================================================= -->
			<!-- TAB 1: REVIEW MODERATION & GRADING -->
			<!-- ========================================================= -->
			{#if activeTab === 'moderation'}
				<div class="space-y-6">
					<!-- Filter Bar -->
					<div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-base-200/60 border border-base-300">
						<div class="flex gap-2">
							<button
								type="button"
								class="btn btn-xs {moderationFilter === 'all' ? 'btn-neutral' : 'btn-ghost'}"
								onclick={() => (moderationFilter = 'all')}
							>
								All ({contracts.length})
							</button>
							<button
								type="button"
								class="btn btn-xs {moderationFilter === 'needs-grading' ? 'btn-warning' : 'btn-ghost'}"
								onclick={() => (moderationFilter = 'needs-grading')}
							>
								Needs Grading ({contracts.filter((c: any) => c.verdict === 'PENDING' && (c.reviewContent || c.score)).length})
							</button>
							<button
								type="button"
								class="btn btn-xs {moderationFilter === 'graded' ? 'btn-success' : 'btn-ghost'}"
								onclick={() => (moderationFilter = 'graded')}
							>
								Graded ({contracts.filter((c: any) => c.verdict !== 'PENDING').length})
							</button>
							<button
								type="button"
								class="btn btn-xs {moderationFilter === 'incomplete' ? 'btn-neutral' : 'btn-ghost'}"
								onclick={() => (moderationFilter = 'incomplete')}
							>
								Pending Submission ({contracts.filter((c: any) => c.verdict === 'PENDING' && !c.reviewContent && !c.score).length})
							</button>
						</div>

						<span class="text-xs text-base-content/50">
							Showing {filteredContracts.length} contract(s)
						</span>
					</div>

					{#if filteredContracts.length === 0}
						<div class="p-8 text-center rounded-3xl border border-base-300 bg-base-200/40">
							<span class="icon-[tabler--inbox] text-3xl text-base-content/40 mb-2"></span>
							<h3 class="font-bold text-lg">No contracts in this view</h3>
							<p class="text-xs text-base-content/60 mt-1">Try switching to another filter tab above.</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#each filteredContracts as c}
								{@const contracteeForm = userForms[c.contractee?.id] ?? {}}
								{@const contractorForm = userForms[c.contractor?.id] ?? {}}

								<div
									class="p-6 rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm space-y-5"
								>
									<!-- Top Row: Participants & Title -->
									<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-base-300/60 pb-4">
										<div>
											<div class="flex items-center gap-2">
												<span class="badge badge-primary badge-sm font-semibold">{c.contractType?.name}</span>
												<span class="badge {getVerdictBadge(c.verdict).class} badge-sm">
													{getVerdictBadge(c.verdict).label}
												</span>
											</div>
											<h3 class="text-xl font-bold mt-1.5">{c.name || '(Title Pending Assignment)'}</h3>
											<div class="flex flex-wrap items-center gap-3 text-xs text-base-content/60 mt-1">
												<span>
													<strong>Contractor:</strong> {c.contractor?.username}
												</span>
												<span>&bull;</span>
												<span>
													<strong>Contractee:</strong> {c.contractee?.username}
												</span>
											</div>
										</div>

										<div class="text-right text-xs text-base-content/50">
											<span>Deadline: {formatDate(c.contractType?.reviewDeadline)}</span>
										</div>
									</div>

									<!-- Middle: Review Submission details & Ban Check -->
									<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
										<!-- Submission Details -->
										<div class="p-4 rounded-2xl bg-base-300/30 border border-base-300/50 space-y-2 text-xs">
											<h4 class="font-bold text-base-content/70 uppercase tracking-wider text-[11px]">
												Participant Submission
											</h4>
											<p><span class="text-base-content/50">Progress:</span> <strong class="text-base-content">{c.progress || '—'}</strong></p>
											<p><span class="text-base-content/50">Score:</span> <strong class="text-primary text-sm">{c.score || '—'}</strong></p>
											<div class="pt-1">
												<span class="text-base-content/50 block mb-0.5">Review Content / URL:</span>
												{#if c.reviewContent}
													{#if c.reviewContent.startsWith('http')}
														<a
															href={c.reviewContent}
															target="_blank"
															rel="noopener noreferrer"
															class="btn btn-outline btn-primary btn-xs gap-1 inline-flex"
														>
															Open Review Link
															<span class="icon-[tabler--external-link]"></span>
														</a>
													{:else}
														<div class="p-2.5 rounded-xl bg-base-100/60 font-serif italic text-xs leading-relaxed">
															"{c.reviewContent}"
														</div>
													{/if}
												{:else}
													<span class="text-base-content/40 italic">No review submitted yet</span>
												{/if}
											</div>
										</div>

										<!-- Contractee Ban List & Preferences (Verification box) -->
										<div class="p-4 rounded-2xl bg-error/10 border border-error/20 space-y-2 text-xs">
											<h4 class="font-bold text-error uppercase tracking-wider text-[11px] flex items-center gap-1.5">
												<span class="icon-[tabler--shield-check]"></span>
												Contractee Ban Check
											</h4>
											<p>
												<span class="text-base-content/50">Banned Genres/Types:</span>
												<strong class="text-error font-semibold block mt-0.5">
													{contracteeForm.bannedGenres || 'None specified'}
												</strong>
											</p>
											<p>
												<span class="text-base-content/50">Preferred Mediums:</span>
												<span>{contracteeForm.preferredMedium || 'Any'}</span>
											</p>
											{#if contracteeForm.anilistUrl}
												<a
													href={contracteeForm.anilistUrl}
													target="_blank"
													rel="noopener noreferrer"
													class="link link-primary text-[11px] inline-flex items-center gap-1"
												>
													View Anilist / Tracker Profile
													<span class="icon-[tabler--external-link]"></span>
												</a>
											{/if}
										</div>
									</div>

									<!-- Bottom Grading Actions -->
									{#if !season.completed}
										<div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-base-300/60">
											<span class="text-xs font-semibold text-base-content/60">Set Verdict:</span>
											<div class="flex flex-wrap gap-2">
												<form method="POST" action="?/setVerdict" use:enhance>
													<input type="hidden" name="seasonId" value={season.id} />
													<input type="hidden" name="contractId" value={c.id} />
													<input type="hidden" name="verdict" value="PASS" />
													<button
														type="submit"
														class="btn btn-xs {c.verdict === 'PASS' ? 'btn-success' : 'btn-outline btn-success'} gap-1"
													>
														<span class="icon-[tabler--check]"></span> PASS
													</button>
												</form>

												<form method="POST" action="?/setVerdict" use:enhance>
													<input type="hidden" name="seasonId" value={season.id} />
													<input type="hidden" name="contractId" value={c.id} />
													<input type="hidden" name="verdict" value="LATE_PASS" />
													<button
														type="submit"
														class="btn btn-xs {c.verdict === 'LATE_PASS' ? 'btn-warning' : 'btn-outline btn-warning'} gap-1"
													>
														<span class="icon-[tabler--clock-check]"></span> LATE PASS
													</button>
												</form>

												<form method="POST" action="?/setVerdict" use:enhance>
													<input type="hidden" name="seasonId" value={season.id} />
													<input type="hidden" name="contractId" value={c.id} />
													<input type="hidden" name="verdict" value="FAIL" />
													<button
														type="submit"
														class="btn btn-xs {c.verdict === 'FAIL' ? 'btn-error' : 'btn-outline btn-error'} gap-1"
													>
														<span class="icon-[tabler--x]"></span> FAIL
													</button>
												</form>

												{#if c.verdict !== 'PENDING'}
													<form method="POST" action="?/setVerdict" use:enhance>
														<input type="hidden" name="seasonId" value={season.id} />
														<input type="hidden" name="contractId" value={c.id} />
														<input type="hidden" name="verdict" value="PENDING" />
														<button type="submit" class="btn btn-xs btn-ghost gap-1">
															Reset to Pending
														</button>
													</form>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>

			<!-- ========================================================= -->
			<!-- TAB 2: MATCHMAKING & CONTRACTS -->
			<!-- ========================================================= -->
			{:else if activeTab === 'matchmaking'}
				<div class="space-y-6">
					<!-- Auto Matchmaking Box -->
					{#if contractTypes.length > 0 && !season.completed}
						<div class="p-6 rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-bold flex items-center gap-2">
									<span class="icon-[tabler--arrows-shuffle] text-primary"></span>
									Random Matchmaking Generator
								</h3>
								<span class="text-xs text-base-content/60">
									{signups.length} participant(s) signed up
								</span>
							</div>

							<p class="text-xs text-base-content/70">
								Clicking auto-assign performs a randomized cyclic permutation (derangement) across all registered participants for the selected contract type. Every participant will be assigned exactly one contractee without self-assignments.
							</p>

							<div class="flex flex-wrap gap-3 pt-2">
								{#each contractTypes as ct}
									<form
										method="POST"
										action="?/autoAssign"
										use:enhance={() => {
											submitting = true;
											return async ({ update }) => {
												await update();
												submitting = false;
											};
										}}
									>
										<input type="hidden" name="seasonId" value={season.id} />
										<input type="hidden" name="slug" value={ct.slug} />
										<button
											type="submit"
											disabled={submitting || signups.length < 2}
											class="btn btn-primary btn-sm gap-2"
										>
											<span class="icon-[tabler--sparkles]"></span>
											Auto-Assign for "{ct.name}"
										</button>
									</form>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Contracts List Table -->
					<div class="rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm p-6 space-y-4">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="icon-[tabler--clipboard-list] text-secondary"></span>
							All Contracts ({contracts.length})
						</h3>

						{#if contracts.length === 0}
							<p class="text-xs text-base-content/50 italic">No contracts generated yet.</p>
						{:else}
							<div class="overflow-x-auto">
								<table class="table table-sm w-full text-xs">
									<thead>
										<tr class="border-b border-base-300 text-base-content/60">
											<th>ID</th>
											<th>Type</th>
											<th>Contractor</th>
											<th>Contractee</th>
											<th>Assigned Title</th>
											<th>Progress</th>
											<th>Score</th>
											<th>Verdict</th>
										</tr>
									</thead>
									<tbody>
										{#each contracts as c}
											<tr class="border-b border-base-300/40 hover:bg-base-300/30">
												<td class="font-mono">{c.id}</td>
												<td>
													<span class="badge badge-soft badge-primary badge-xs">{c.contractType?.slug}</span>
												</td>
												<td class="font-semibold">{c.contractor?.username}</td>
												<td class="font-semibold">{c.contractee?.username}</td>
												<td>{c.name || '—'}</td>
												<td>{c.progress || '—'}</td>
												<td>{c.score || '—'}</td>
												<td>
													<span class="badge {getVerdictBadge(c.verdict).class} badge-xs">
														{getVerdictBadge(c.verdict).label}
													</span>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>
				</div>

			<!-- ========================================================= -->
			<!-- TAB 3: PARTICIPANTS -->
			<!-- ========================================================= -->
			{:else if activeTab === 'participants'}
				<div class="rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm p-6 space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="icon-[tabler--users] text-primary"></span>
							Registered Participants ({signups.length})
						</h3>
					</div>

					{#if signups.length === 0}
						<p class="text-xs text-base-content/50 italic">No users have signed up yet.</p>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each signups as s}
								{@const uForm = userForms[s.user?.id] ?? {}}
								<div class="p-4 rounded-2xl bg-base-300/40 border border-base-300/60 space-y-2 text-xs">
									<div class="flex items-center gap-3">
										<img
											src={s.user?.avatarUrl}
											alt={s.user?.username}
											class="w-10 h-10 rounded-xl object-cover ring-1 ring-primary/30"
										/>
										<div>
											<h4 class="font-bold text-sm">{s.user?.username}</h4>
											<span class="text-[11px] text-base-content/50">
												Rep: {uForm.repServer || 'None'}
											</span>
										</div>
									</div>

									<div class="space-y-1 pt-1 border-t border-base-300/50 text-[11px]">
										<p><span class="text-base-content/50">Preferred Medium:</span> {uForm.preferredMedium || 'Any'}</p>
										<p><span class="text-base-content/50 text-error">Banned:</span> <span class="text-error font-medium">{uForm.bannedGenres || 'None'}</span></p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

			<!-- ========================================================= -->
			<!-- TAB 4: SEASONS & CONTRACT TYPES -->
			<!-- ========================================================= -->
			{:else if activeTab === 'seasons'}
				<div class="space-y-6">
					<!-- Create Season Box -->
					<div class="p-6 rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm space-y-4">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="icon-[tabler--calendar-plus] text-primary"></span>
							Create New Season
						</h3>

						<form
							method="POST"
							action="?/createSeason"
							use:enhance={() => {
								submitting = true;
								return async ({ update }) => {
									await update();
									submitting = false;
								};
							}}
							class="space-y-4"
						>
							<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div class="space-y-1.5">
									<label for="new-season-name" class="label text-xs uppercase tracking-wider text-base-content/60">
										Season Name
									</label>
									<input
										id="new-season-name"
										name="name"
										type="text"
										class="input input-bordered w-full"
										placeholder="e.g. Summer 2026 Season"
										required
									/>
								</div>

								<div class="space-y-1.5">
									<label for="new-signups-start" class="label text-xs uppercase tracking-wider text-base-content/60">
										Signups Start
									</label>
									<input
										id="new-signups-start"
										name="signupsStart"
										type="datetime-local"
										class="input input-bordered w-full"
										value={toDatetimeLocal()}
										required
									/>
								</div>

								<div class="space-y-1.5">
									<label for="new-signups-end" class="label text-xs uppercase tracking-wider text-base-content/60">
										Signups End
									</label>
									<input
										id="new-signups-end"
										name="signupsEnd"
										type="datetime-local"
										class="input input-bordered w-full"
										value={toDatetimeLocal(new Date(Date.now() + 7 * 86400000))}
										required
									/>
								</div>
							</div>

							<div class="flex justify-end pt-2">
								<button type="submit" disabled={submitting} class="btn btn-primary gap-2">
									<span class="icon-[tabler--plus]"></span>
									Create Season
								</button>
							</div>
						</form>
					</div>

					<!-- Current Season Controls & Contract Types -->
					{#if season}
						<div class="p-6 rounded-3xl border border-base-300 bg-base-200/50 backdrop-blur-sm space-y-6">
							<div class="flex flex-wrap items-center justify-between gap-4 border-b border-base-300/60 pb-4">
								<div>
									<h3 class="text-lg font-bold">{season.name}</h3>
									<p class="text-xs text-base-content/60 mt-0.5">
										Signups: {formatDate(season.signupsStart)} — {formatDate(season.signupsEnd)}
									</p>
								</div>

								<!-- Toggle Complete Form -->
								<form method="POST" action="?/updateSeason" use:enhance>
									<input type="hidden" name="seasonId" value={season.id} />
									<input type="hidden" name="completed" value={season.completed ? 'false' : 'true'} />
									<button
										type="submit"
										class="btn btn-sm {season.completed ? 'btn-outline btn-warning' : 'btn-outline btn-error'} gap-1.5"
									>
										<span class="icon-[tabler--{season.completed ? 'rotate' : 'check'}]"></span>
										{season.completed ? 'Reactivate Season' : 'Mark Season as Completed'}
									</button>
								</form>
							</div>

							<!-- Contract Types List -->
							<div class="space-y-4">
								<h4 class="font-bold text-sm text-base-content/80 uppercase tracking-wider">
									Contract Types for {season.name}
								</h4>

								{#if contractTypes.length === 0}
									<p class="text-xs text-base-content/50 italic">No contract types created yet for this season.</p>
								{:else}
									<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
										{#each contractTypes as ct}
											<div class="p-4 rounded-2xl bg-base-300/40 border border-base-300/60 space-y-2 text-xs">
												<div class="flex items-center justify-between">
													<div class="flex items-center gap-2">
														<span class="icon-[tabler--{ct.icon || 'star'}] text-primary text-lg"></span>
														<strong class="text-sm font-bold">{ct.name}</strong>
													</div>
													<span class="badge badge-neutral badge-xs font-mono">{ct.slug}</span>
												</div>
												<p><span class="text-base-content/50">Discord Channel:</span> {ct.discordChannelId}</p>
												<p><span class="text-base-content/50">Assignment:</span> {formatDate(ct.assignmentStart)} — {formatDate(ct.assignmentEnd)}</p>
												<p><span class="text-base-content/50">Review Deadline:</span> <strong class="text-warning">{formatDate(ct.reviewDeadline)}</strong></p>
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Add Contract Type Form -->
							{#if !season.completed}
								<div class="pt-4 border-t border-base-300/60 space-y-3">
									<h4 class="font-bold text-sm text-primary uppercase tracking-wider">
										Add Contract Type
									</h4>

									<form method="POST" action="?/createContractType" use:enhance class="space-y-4">
										<input type="hidden" name="seasonId" value={season.id} />

										<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<div class="space-y-1">
												<label for="ct-name" class="label text-[11px] uppercase tracking-wider text-base-content/60">Name</label>
												<input id="ct-name" name="name" type="text" placeholder="e.g. Base Contract" class="input input-sm input-bordered w-full" required />
											</div>
											<div class="space-y-1">
												<label for="ct-slug" class="label text-[11px] uppercase tracking-wider text-base-content/60">Slug (max 16 chars)</label>
												<input id="ct-slug" name="slug" type="text" placeholder="base" maxlength="16" class="input input-sm input-bordered w-full" required />
											</div>
											<div class="space-y-1">
												<label for="ct-channel" class="label text-[11px] uppercase tracking-wider text-base-content/60">Discord Channel ID</label>
												<input id="ct-channel" name="discordChannelId" type="text" placeholder="1077741836749242468" class="input input-sm input-bordered w-full" required />
											</div>
										</div>

										<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<div class="space-y-1">
												<label for="ct-start" class="label text-[11px] uppercase tracking-wider text-base-content/60">Assignment Start</label>
												<input id="ct-start" name="assignmentStart" type="datetime-local" class="input input-sm input-bordered w-full" value={toDatetimeLocal(new Date(Date.now() + 86400000))} required />
											</div>
											<div class="space-y-1">
												<label for="ct-end" class="label text-[11px] uppercase tracking-wider text-base-content/60">Assignment End</label>
												<input id="ct-end" name="assignmentEnd" type="datetime-local" class="input input-sm input-bordered w-full" value={toDatetimeLocal(new Date(Date.now() + 3 * 86400000))} required />
											</div>
											<div class="space-y-1">
												<label for="ct-deadline" class="label text-[11px] uppercase tracking-wider text-base-content/60">Review Deadline</label>
												<input id="ct-deadline" name="reviewDeadline" type="datetime-local" class="input input-sm input-bordered w-full" value={toDatetimeLocal(new Date(Date.now() + 14 * 86400000))} required />
											</div>
										</div>

										<div class="flex justify-end">
											<button type="submit" class="btn btn-sm btn-primary gap-1.5">
												<span class="icon-[tabler--plus]"></span> Add Contract Type
											</button>
										</div>
									</form>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</main>
	<Footer />
</div>
