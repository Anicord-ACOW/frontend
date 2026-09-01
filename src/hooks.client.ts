import './lib/client/init';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const proto = event.request.headers.get('x-forwarded-proto');
    const host = event.request.headers.get('x-forwarded-host');
    if (proto && host) {
        event.url = new URL(`${proto}://${host}${event.url.pathname}${event.url.search}`);
    }
    return resolve(event);
};