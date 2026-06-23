import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, parent }) => {
	const { apiUrl, user } = await parent();

	if (!user) redirect(302, '/login');

	const token = cookies.get('auth-token');
	let signupForm = null;

	try {
		const res = await fetch(`${apiUrl}/users/me/signup-form`, {
			headers: { Cookie: `auth-token=${token}` }
		});
		if (res.ok) {
			const data = await res.json();
			if (data.success) signupForm = data.form;
		}
	} catch {
		// silently ignore
	}

	return { signupForm };
};

export const actions: Actions = {
	update: async ({ request, cookies, parent }) => {
		const { apiUrl } = await parent();
		const token = cookies.get('auth-token');
		const fd = await request.formData();

		const get = (key: string) => (fd.get(key) as string) ?? '';
		const getBool = (key: string) => fd.get(key) === 'on';
		const getNullable = (key: string) => get(key) || null;
		const getTriBool = (key: string): boolean | null => {
			const v = get(key);
			if (v === 'true') return true;
			if (v === 'false') return false;
			return null;
		};

		const body = {
			repServer: get('repServer'),
			anilistUrl: get('anilistUrl'),
			preferredMedium: get('preferredMedium'),
			acceptingMedium: get('acceptingMedium'),
			preferredGenres: get('preferredGenres'),
			bannedGenres: get('bannedGenres'),
			extremeSpecialParticipation: getBool('extremeSpecialParticipation'),
			sponsorParticipation: getBool('sponsorParticipation'),
			aidParadeParticipation: getBool('aidParadeParticipation'),
			gameProfileUrl: getNullable('gameProfileUrl'),
			pcPower: getNullable('pcPower'),
			hasXboxGamePass: getTriBool('hasXboxGamePass'),
			preferredGameGenres: fd.getAll('preferredGameGenres') as string[],
			challengeLevelPreference: getNullable('challengeLevelPreference'),
			gameLengthPreference: getNullable('gameLengthPreference'),
			competitiveBlitzParticipation: getBool('competitiveBlitzParticipation'),
			casualBlitzParticipation: getBool('casualBlitzParticipation'),
			bookClubParticipation: getBool('bookClubParticipation'),
			gameClubParticipation: getBool('gameClubParticipation'),
			notesForStaff: get('notesForStaff'),
			notesForContractor: get('notesForContractor')
		};

		try {
			const res = await fetch(`${apiUrl}/users/me/signup-form`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth-token=${token}`
				},
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, { error: (err as any).message ?? 'Failed to update form.' });
			}

			return { success: true };
		} catch {
			return fail(500, { error: 'Network error — please try again.' });
		}
	}
};
