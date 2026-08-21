import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, request }) => {
	const apiUrl = env.API_ORIGIN || 'http://localhost:3000';


	let user = null;
	try {
		const cookieHeader = request.headers.get('cookie') || '';
		const res = await fetch(`${apiUrl}/users/me`, {
            method: 'GET',
            headers: {
                // Pass the browser's incoming cookies to your backend API server
                'Cookie': cookieHeader,
                'Accept': 'application/json'
            },
            // Keep this so client-side hydration transitions work perfectly too!
            credentials: 'include' 
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

	return { apiUrl, user };
};
