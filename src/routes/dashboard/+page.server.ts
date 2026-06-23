import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, parent }) => {
	const { apiUrl, user } = await parent();

	// Redirect to login if not authenticated
	if (!user) {
		redirect(302, '/login');
	}

	const token = cookies.get('auth-token');
	let signupForm = null;

	try {
		const res = await fetch(`${apiUrl}/users/me/signup-form`, {
			headers: {
				Cookie: `auth-token=${token}`
			}
		});
		if (res.ok) {
			const data = await res.json();
			if (data.success) {
				signupForm = data.form;
			}
		}
	} catch {
		// silently ignore — form stays null
	}

	return { signupForm };
};
