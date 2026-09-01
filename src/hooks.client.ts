import './lib/client/init';
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    console.log('=== DEBUG ===');
    console.log('Origin:', event.request.headers.get('origin'));
    console.log('Host:', event.request.headers.get('host'));
    console.log('X-Forwarded-Host:', event.request.headers.get('x-forwarded-host'));
    console.log('X-Forwarded-Proto:', event.request.headers.get('x-forwarded-proto'));
    console.log('URL:', event.url.href);
    console.log('=============');
    
    const proto = event.request.headers.get('x-forwarded-proto');
    const host = event.request.headers.get('x-forwarded-host');
    if (proto && host) {
        event.url = new URL(`${proto}://${host}${event.url.pathname}${event.url.search}`);
    }
    return resolve(event);
};