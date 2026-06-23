import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const apiUrl = env.API_ORIGIN || 'http://localhost:3000';
	const token = cookies.get('auth-token');

	let user = null;

	if (token) {
		try {
			const res = await fetch(`${apiUrl}/users/me`, {
				headers: {
					Cookie: `auth-token=${token}`
				}
			});
			if (res.ok) {
				const data = await res.json();
				if (data.success) {
					user = data.user;
				}
			}
		} catch {
			// silently ignore — user stays null and the login button shows
		}
	}

	return { apiUrl, user };
};
