import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, Actions } from './$types';

const apiUrl = env.API_URL || 'http://localhost:3000';

export const load: PageServerLoad = async ({ cookies, parent }) => {
	const { user } = await parent();

	if (!user) {
		redirect(302, '/');
	}

	const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
	const authHeaders = { Cookie: `auth-token=${token}` };

	let currentSeason = null;
	let contractTypes: any[] = [];
	let signedUp = false;
	let signupForm = null;
	let contracts: any[] = [];
	const contracteeForms: Record<string, any> = {};

	try {
		// 1. Get current season
		const seasonRes = await fetch(`${apiUrl}/seasons/current`, { headers: authHeaders });
		if (seasonRes.ok) {
			const seasonData = await seasonRes.json();
			if (seasonData.success && seasonData.season) {
				currentSeason = seasonData.season;

				// 2. Fetch contract types for current season
				const typesRes = await fetch(`${apiUrl}/seasons/${currentSeason.id}/contract-types`, {
					headers: authHeaders
				});
				if (typesRes.ok) {
					const typesData = await typesRes.json();
					if (typesData.success) {
						contractTypes = typesData.contractTypes ?? [];
					}
				}

				// 3. Fetch user's signup status
				const signupRes = await fetch(`${apiUrl}/seasons/${currentSeason.id}/signup`, {
					headers: authHeaders
				});
				if (signupRes.ok) {
					const signupData = await signupRes.json();
					if (signupData.success) {
						signedUp = !!signupData.signedUp;
					}
				}

				// 4. Fetch user's signup preferences form
				const formRes = await fetch(`${apiUrl}/users/me/signup-form`, { headers: authHeaders });
				if (formRes.ok) {
					const formData = await formRes.json();
					if (formData.success) {
						signupForm = formData.form;
					}
				}

				// 5. Fetch user's contracts for this season
				const contractsRes = await fetch(`${apiUrl}/seasons/${currentSeason.id}/contracts`, {
					headers: authHeaders
				});
				if (contractsRes.ok) {
					const contractsData = await contractsRes.json();
					if (contractsData.success) {
						contracts = contractsData.contracts ?? [];

						// Fetch contractee signup forms for contracts where the user is the contractor
						for (const c of contracts) {
							if (c.contractor?.id === user.id && c.contractee?.id) {
								try {
									const cFormRes = await fetch(`${apiUrl}/users/${c.contractee.id}/signup-form`, {
										headers: authHeaders
									});
									if (cFormRes.ok) {
										const cFormData = await cFormRes.json();
										if (cFormData.success) {
											contracteeForms[c.contractee.id] = cFormData.form;
										}
									}
								} catch {
									// ignore individual form fetch error
								}
							}
						}
					}
				}
			}
		}
	} catch {
		// ignore fetch errors
	}

	return {
		user,
		currentSeason,
		contractTypes,
		signedUp,
		signupForm,
		contracts,
		contracteeForms
	};
};

export const actions: Actions = {
	signup: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/signup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, { error: (err as any).error ?? 'Failed to sign up for season.' });
			}

			return { success: true, message: 'Successfully signed up for the season!' };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	withdraw: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/signup`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, {
					error: (err as any).error ?? 'Failed to withdraw from season signups.'
				});
			}

			return { success: true, message: 'Successfully withdrew from season signups.' };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	assignContract: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;
		const contractId = fd.get('contractId') as string;
		const name = (fd.get('name') as string)?.trim();

		if (!name) {
			return fail(400, { error: 'Please enter a title for the contract.' });
		}

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/contracts/${contractId}/assign`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({ name })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, {
					error: (err as any).error ?? 'Failed to assign contract title.'
				});
			}

			return { success: true, message: 'Contract title assigned successfully!' };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	},

	updateReview: async ({ cookies, request }) => {
		const token = cookies.get('auth-token') || cookies.get('__Http-auth-token');
		const fd = await request.formData();
		const seasonId = fd.get('seasonId') as string;
		const contractId = fd.get('contractId') as string;
		const progress = (fd.get('progress') as string) ?? '';
		const score = (fd.get('score') as string) ?? '';
		const reviewContent = (fd.get('reviewContent') as string) ?? '';

		try {
			const res = await fetch(`${apiUrl}/seasons/${seasonId}/contracts/${contractId}/review`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify({
					progress,
					score,
					reviewContent
				})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, {
					error: (err as any).error ?? 'Failed to update contract review.'
				});
			}

			return { success: true, message: 'Contract progress and review updated successfully!' };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	}
};
