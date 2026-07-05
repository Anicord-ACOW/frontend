import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url, cookies }) => {
	const token = url.searchParams.get('token');
	const redirectTo = url.searchParams.get('redirect') || '/';

	if (!token) {
		redirect(302, '/');
	}

	cookies.set('auth-token', token, {
		path: '/',
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		maxAge: 7 * 86400 // 7 days
	});

	redirect(302, redirectTo);
};
