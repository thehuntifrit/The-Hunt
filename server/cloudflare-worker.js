const GOOGLE_KEYS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const PROJECT_ID = 'the-hunt-ifrit';
const ALLOWED_ORIGINS = [
    'https://the-hunt-ifrit.firebaseapp.com',
    'https://the-hunt-ifrit.web.app',
    'https://thehuntifrit.github.io'
];

let publicKeysCache = null;
let keysExpiresAt = 0;
let keysFetchingPromise = null;

const BOT_UA_PATTERN = /^(python-requests|python\/|curl\/|wget\/)/i;

export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get('Origin');
        const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': allowedOrigin,
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Authorization',
                }
            });
        }

        const ua = request.headers.get('User-Agent') || '';
        if (BOT_UA_PATTERN.test(ua)) {
            return new Response('Forbidden', {
                status: 403,
                headers: { 'Access-Control-Allow-Origin': allowedOrigin }
            });
        }

        const country = request.cf?.country;
        if (country && country !== 'JP') {
            return new Response('Forbidden', {
                status: 403,
                headers: { 'Access-Control-Allow-Origin': allowedOrigin }
            });
        }

        const url = new URL(request.url);
        const lodestoneId = url.searchParams.get('lodestoneId');

        if (!lodestoneId || !/^\d+$/.test(lodestoneId)) {
            return new Response('Invalid or missing lodestoneId', {
                status: 400,
                headers: { 'Access-Control-Allow-Origin': allowedOrigin }
            });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response('Unauthorized', {
                status: 401,
                headers: { 'Access-Control-Allow-Origin': allowedOrigin }
            });
        }
        const token = authHeader.split(' ')[1];

        try {
            await verifyFirebaseToken(token);
        } catch (e) {
            return new Response('Unauthorized', {
                status: 401,
                headers: { 'Access-Control-Allow-Origin': allowedOrigin }
            });
        }

        const targetUrl = `https://jp.finalfantasyxiv.com/lodestone/character/${lodestoneId}/`;

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Compatible; TheHuntIfritBot/1.0)',
                    'Accept-Language': 'ja'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return new Response('Character not found', {
                        status: 404,
                        headers: { 'Access-Control-Allow-Origin': allowedOrigin }
                    });
                }
                throw new Error(`Upstream error: ${response.status}`);
            }

            const body = await response.text();

            return new Response(body, {
                headers: {
                    'Access-Control-Allow-Origin': allowedOrigin,
                    'Content-Type': 'text/html; charset=UTF-8',
                    'Cache-Control': 'no-cache'
                }
            });

        } catch (e) {
            return new Response('Internal Server Error', {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': allowedOrigin }
            });
        }
    }
};

async function verifyFirebaseToken(token) {
    if (!token || typeof token !== 'string') throw new Error('Missing token');
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Malformed token');

    const [headerB64, payloadB64, signatureB64] = parts;

    let header, payload;
    try {
        header = JSON.parse(atobUrl(headerB64));
        payload = JSON.parse(atobUrl(payloadB64));
    } catch {
        throw new Error('Failed to parse token');
    }

    if (header.alg !== 'RS256') throw new Error('Invalid algorithm');

    const kid = header.kid;
    if (!kid) throw new Error('Missing kid');

    const keys = await getPublicKeys();
    const jwk = keys[kid];
    if (!jwk) throw new Error('Invalid kid');

    const isValid = await verifySignature(jwk, headerB64, payloadB64, signatureB64);
    if (!isValid) throw new Error('Invalid signature');

    const now = Math.floor(Date.now() / 1000);
    if (payload.aud !== PROJECT_ID) throw new Error('Invalid audience');
    if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) throw new Error('Invalid issuer');
    if (payload.exp < now) throw new Error('Token expired');
    if (payload.iat > now) throw new Error('Token issued in future');
    if (payload.nbf !== undefined && payload.nbf > now) throw new Error('Token not yet valid');
    if (!payload.sub) throw new Error('Empty subject');
}

async function getPublicKeys() {
    const now = Date.now();
    if (publicKeysCache && now < keysExpiresAt) {
        return publicKeysCache;
    }

    if (keysFetchingPromise) {
        return keysFetchingPromise;
    }

    keysFetchingPromise = (async () => {
        try {
            const resp = await fetch(GOOGLE_KEYS_URL);
            if (!resp.ok) throw new Error('Failed to fetch public keys');

            const cacheControl = resp.headers.get('Cache-Control');
            let maxAge = 3600;
            if (cacheControl) {
                const match = cacheControl.match(/max-age=(\d+)/);
                if (match) maxAge = parseInt(match[1], 10);
            }

            const data = await resp.json();
            const keysMap = {};
            if (data.keys) {
                for (const key of data.keys) {
                    keysMap[key.kid] = key;
                }
            }

            publicKeysCache = keysMap;
            keysExpiresAt = Date.now() + (maxAge * 1000);
            return publicKeysCache;
        } finally {
            keysFetchingPromise = null;
        }
    })();

    return keysFetchingPromise;
}

function atobUrl(str) {
    if (typeof str !== 'string') throw new Error('Invalid base64url input');
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (base64.length % 4) {
        case 0: break;
        case 2: base64 += '=='; break;
        case 3: base64 += '='; break;
        default: throw new Error('Illegal base64url string!');
    }
    return atob(base64);
}

async function verifySignature(jwk, headerB64, payloadB64, signatureB64) {
    const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atobUrl(signatureB64), c => c.charCodeAt(0));

    return await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        signature,
        data
    );
}