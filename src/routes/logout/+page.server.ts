import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url, cookies }) => {
	let domain = undefined;
	if (url.hostname.includes('cestpaspete.ovh')) {
		domain = '.cestpaspete.ovh';
	}
	cookies.delete('auth-token', { path: '/', ...(domain && { domain }) });
	redirect(302, '/');
};
