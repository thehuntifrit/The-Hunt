const GOOGLE_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const PROJECT_ID = 'the-hunt-ifrit';
const ALLOWED_ORIGIN = '*';

let publicKeysCache = null;
let keysExpiresAt = 0;

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Authorization',
                }
            });
        }

        const url = new URL(request.url);
        const lodestoneId = url.searchParams.get('lodestoneId');

        if (!lodestoneId || !/^\d+$/.test(lodestoneId)) {
            return new Response('Invalid or missing lodestoneId', {
                status: 400,
                headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
            });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response('Unauthorized: Missing token', {
                status: 401,
                headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
            });
        }
        const token = authHeader.split(' ')[1];

        try {
            await verifyFirebaseToken(token);
        } catch (e) {
            return new Response(`Unauthorized: ${e.message}`, {
                status: 401,
                headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
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
                        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
                    });
                }
                throw new Error(`Upstream error: ${response.status}`);
            }

            const body = await response.text();

            return new Response(body, {
                headers: {
                    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                    'Content-Type': 'text/html; charset=UTF-8',
                    'Cache-Control': 'no-cache'
                }
            });

        } catch (e) {
            return new Response(e.message, {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
            });
        }
    }
};

async function verifyFirebaseToken(token) {
    const [headerB64, payloadB64, signatureB64] = token.split('.');

    const header = JSON.parse(atobUrl(headerB64));
    const payload = JSON.parse(atobUrl(payloadB64));

    if (header.alg !== 'RS256') throw new Error('Invalid algorithm');

    const kid = header.kid;
    if (!kid) throw new Error('Missing kid');

    const keys = await getPublicKeys();
    const pem = keys[kid];
    if (!pem) throw new Error('Invalid kid');

    const isValid = await verifySignature(pem, headerB64, payloadB64, signatureB64);
    if (!isValid) throw new Error('Invalid signature');

    const now = Math.floor(Date.now() / 1000);
    if (payload.aud !== PROJECT_ID) throw new Error('Invalid audience');
    if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) throw new Error('Invalid issuer');
    if (payload.exp < now) throw new Error('Token expired');
    if (payload.iat > now) throw new Error('Token issued in future');
    if (!payload.sub) throw new Error('Empty subject');
}

async function getPublicKeys() {
    const now = Date.now();
    if (publicKeysCache && now < keysExpiresAt) {
        return publicKeysCache;
    }

    const resp = await fetch(GOOGLE_KEYS_URL);
    if (!resp.ok) throw new Error('Failed to fetch public keys');

    const cacheControl = resp.headers.get('Cache-Control');
    let maxAge = 3600;
    if (cacheControl) {
        const match = cacheControl.match(/max-age=(\d+)/);
        if (match) maxAge = parseInt(match[1], 10);
    }

    publicKeysCache = await resp.json();
    keysExpiresAt = now + (maxAge * 1000);
    return publicKeysCache;
}

function atobUrl(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (base64.length % 4) {
        case 0: break;
        case 2: base64 += '=='; break;
        case 3: base64 += '='; break;
        default: throw new Error('Illegal base64url string!');
    }
    return atob(base64);
}

async function verifySignature(pem, headerB64, payloadB64, signatureB64) {
    const binaryKey = str2ab(atob(pem
        .replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\s/g, '')));

    const key = await crypto.subtle.importKey(
        'spki',
        binaryKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = str2ab(atobUrl(signatureB64));

    return await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        signature,
        data
    );
}

function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
