import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, Actions } from './$types';

const apiUrl = env.API_URL || 'http://localhost:3000';

export const load: PageServerLoad = async ({ cookies, parent, url }) => {
	const { user } = await parent();

	if (!user) {
		redirect(302, '/');
	}

	if (!user.roles?.includes('admin')) {
		redirect(302, '/dashboard');
	}

	const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
	const authHeaders = { Cookie: `auth-token=${token}` };

	let seasons: any[] = [];
	let currentSeason: any = null;
	let contractTypes: any[] = [];
	let signups: any[] = [];
	let contracts: any[] = [];
	const userForms: Record<string, any> = {};

	try {
		// 1. Fetch all seasons
		const seasonsRes = await fetch(`${apiUrl}/seasons`, { headers: authHeaders });
		if (seasonsRes.ok) {
			const seasonsData = await seasonsRes.json();
			if (seasonsData.success) {
				seasons = seasonsData.seasons ?? [];
			}
		}

		// Selected season id from search params or default to current / first season
		const selectedSeasonId = url.searchParams.get('seasonId');
		if (selectedSeasonId) {
			const targetRes = await fetch(`${apiUrl}/seasons/${selectedSeasonId}`, { headers: authHeaders });
			if (targetRes.ok) {
				const targetData = await targetRes.json();
				if (targetData.success) currentSeason = targetData.season;
			}
		} else {
			const curRes = await fetch(`${apiUrl}/seasons/current`, { headers: authHeaders });
			if (curRes.ok) {
				const curData = await curRes.json();
				if (curData.success && curData.season) {
					currentSeason = curData.season;
				}
			}
			if (!currentSeason && seasons.length > 0) {
				currentSeason = seasons[0];
			}
		}

		if (currentSeason) {
			// 2. Fetch contract types for this season
			const typesRes = await fetch(`${apiUrl}/seasons/${currentSeason.id}/contract-types`, {
				headers: authHeaders
			});
			if (typesRes.ok) {
				const typesData = await typesRes.json();
				if (typesData.success) contractTypes = typesData.contractTypes ?? [];
			}

			// 3. Fetch signups for this season
			const signupsRes = await fetch(`${apiUrl}/seasons/${currentSeason.id}/signups`, {
				headers: authHeaders
			});
			if (signupsRes.ok) {
				const signupsData = await signupsRes.json();
				if (signupsData.success) signups = signupsData.signups ?? [];
			}

			// 4. Fetch all contracts for this season
			const contractsRes = await fetch(`${apiUrl}/seasons/${currentSeason.id}/contracts`, {
				headers: authHeaders
			});
			if (contractsRes.ok) {
				const contractsData = await contractsRes.json();
				if (contractsData.success) contracts = contractsData.contracts ?? [];
			}

			// 5. Gather unique user IDs to fetch signup forms
			const userIds = new Set<string>();
			for (const s of signups) {
				if (s.user?.id) userIds.add(s.user.id.toString());
			}
			for (const c of contracts) {
				if (c.contractor?.id) userIds.add(c.contractor.id.toString());
				if (c.contractee?.id) userIds.add(c.contractee.id.toString());
			}

			await Promise.all(
				Array.from(userIds).map(async (uid) => {
					try {
						const formRes = await fetch(`${apiUrl}/users/${uid}/signup-form`, {
							headers: authHeaders
						});
						if (formRes.ok) {
							const formData = await formRes.json();
							if (formData.success) userForms[uid] = formData.form;
						}
					} catch {
						// ignore individual failures
					}
				})
			);
		}
	} catch {
		// ignore load errors
	}

	return {
		user,
		seasons,
		currentSeason,
		contractTypes,
		signups,
		contracts,
		userForms
	};
};

export const actions: Actions = {
	createSeason: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const name = (fd.get('name') as string)?.trim();
		const signupsStart = fd.get('signupsStart') as string;
		const signupsEnd = fd.get('signupsEnd') as string;

		if (!name || !signupsStart || !signupsEnd) {
			return fail(400, { error: 'Please provide all season fields.' });
		}

		try {
			const res = await fetch(`${apiUrl}/seasons`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({
					name,
					signupsStart: new Date(signupsStart).toISOString(),
					signupsEnd: new Date(signupsEnd).toISOString()
				})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, { error: (err as any).error ?? 'Failed to create season.' });
			}

			return { success: true, message: 'New season created successfully!' };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	updateSeason: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;
		const completed = fd.get('completed') === 'true';

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({ completed })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, { error: (err as any).error ?? 'Failed to update season.' });
			}

			return { success: true, message: `Season marked as ${completed ? 'completed' : 'active'}!` };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	createContractType: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;
		const name = (fd.get('name') as string)?.trim();
		const slug = (fd.get('slug') as string)?.trim().toLowerCase();
		const icon = (fd.get('icon') as string)?.trim() || 'device-tv';
		const discordChannelId = (fd.get('discordChannelId') as string)?.trim();
		const assignmentStart = fd.get('assignmentStart') as string;
		const assignmentEnd = fd.get('assignmentEnd') as string;
		const reviewDeadline = fd.get('reviewDeadline') as string;

		if (!name || !slug || !discordChannelId || !assignmentStart || !assignmentEnd || !reviewDeadline) {
			return fail(400, { error: 'All contract type fields are required.' });
		}

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/contract-types`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({
					name,
					slug,
					icon,
					discordChannelId,
					assignmentStart: new Date(assignmentStart).toISOString(),
					assignmentEnd: new Date(assignmentEnd).toISOString(),
					reviewDeadline: new Date(reviewDeadline).toISOString()
				})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, { error: (err as any).error ?? 'Failed to create contract type.' });
			}

			return { success: true, message: 'Contract type created successfully!' };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	autoAssign: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;
		const slug = fd.get('slug') as string;

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/contract-types/${slug}/auto-assign`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, {
					error: (err as any).error ?? 'Failed to auto-assign contracts.'
				});
			}

			const data = await res.json();
			return {
				success: true,
				message: `Successfully generated ${data.count} randomized contract pairings!`
			};
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	createContract: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;
		const slug = fd.get('slug') as string;
		const contractor = fd.get('contractor') as string;
		const contractee = fd.get('contractee') as string;

		if (!contractor || !contractee) {
			return fail(400, { error: 'Please select both contractor and contractee.' });
		}

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/contract-types/${slug}/contracts`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({
					contractor,
					contractee
				})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, {
					error: (err as any).error ?? 'Failed to manually create contract.'
				});
			}

			return { success: true, message: 'Contract paired successfully!' };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	setVerdict: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;
		const contractId = fd.get('contractId') as string;
		const verdict = fd.get('verdict') as string;

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/contracts/${contractId}/verdict`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({ verdict })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, {
					error: (err as any).error ?? 'Failed to set contract verdict.'
				});
			}

			return { success: true, message: `Verdict updated to ${verdict}!` };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	}
};
