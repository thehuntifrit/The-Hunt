// ============================================================
// the-hunt-ifrit 認証Worker
//
//   GET  /code    : ログイン中ユーザー(uid)専用の認証コードを返す
//   POST /verify  : Lodestoneの自己紹介文に、そのuid専用のコードがあるか確認し、
//                   問題なければカスタムクレーム(verified / lid / cname)を付与する
//
// 必要なシークレット(Cloudflare: 設定 → 変数とシークレット → 種類「シークレット」)
//   SA_EMAIL        サービスアカウントJSONの client_email
//   SA_PRIVATE_KEY  サービスアカウントJSONの private_key (PEM。改行そのままで貼る)
//   HUNT_SECRET     認証コード生成用のランダム文字列(32文字以上。一度決めたら変更しない)
// ============================================================

const PROJECT_ID = 'the-hunt-ifrit';
const PROJECT_NUMBER = '285578581189'; // appId "1:285578581189:web:..." の数字部分

// App Checkトークンの検証。想定外の理由で正規ユーザーが弾かれる場合は false にすれば一時的に外せる
const REQUIRE_APP_CHECK = true;

const GOOGLE_KEYS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const APPCHECK_KEYS_URL = 'https://firebaseappcheck.googleapis.com/v1/jwks';

const ALLOWED_ORIGINS = [
    'https://the-hunt-ifrit.firebaseapp.com',
    'https://the-hunt-ifrit.web.app',
    'https://thehuntifrit.github.io'
];
// ローカル開発用(Live Serverの既定ポート)。不要なら削除してよい
const DEV_ORIGINS = ['http://localhost:5500', 'http://127.0.0.1:5500'];
const ALL_ORIGINS = [...ALLOWED_ORIGINS, ...DEV_ORIGINS];

const BOT_UA_PATTERN = /^(python-requests|python\/|curl\/|wget\/)/i;
const LODESTONE_TIMEOUT_MS = 8000;
const VERIFY_MAX_ATTEMPTS = 10;               // uidごとの /verify 試行回数
const VERIFY_WINDOW_MS = 60 * 60 * 1000;      // 上記の集計期間(1時間)

const encoder = new TextEncoder();

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin');
        const originOk = !!origin && ALL_ORIGINS.includes(origin);
        const corsHeaders = originOk
            ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' }
            : { 'Vary': 'Origin' };

        const reply = (status, body) => new Response(JSON.stringify(body), {
            status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json; charset=UTF-8',
                'Cache-Control': 'no-store'
            }
        });

        if (request.method === 'OPTIONS') {
            if (!originOk) return new Response(null, { status: 403, headers: corsHeaders });
            return new Response(null, {
                status: 204,
                headers: {
                    ...corsHeaders,
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Firebase-AppCheck',
                    'Access-Control-Max-Age': '86400'
                }
            });
        }

        // ブラウザ以外からの雑なアクセスを減らす補助的なチェック(これだけで防御にはならない)
        if (!originOk) return reply(403, { success: false, reason: 'forbidden' });
        if (BOT_UA_PATTERN.test(request.headers.get('User-Agent') || '')) {
            return reply(403, { success: false, reason: 'forbidden' });
        }
        const country = request.cf?.country;
        if (country && country !== 'JP') return reply(403, { success: false, reason: 'region' });

        const path = new URL(request.url).pathname;
        const isCode = path === '/code' && request.method === 'GET';
        const isVerify = path === '/verify' && request.method === 'POST';
        if (!isCode && !isVerify) return reply(404, { success: false, reason: 'not_found_route' });

        if (!env.SA_EMAIL || !env.SA_PRIVATE_KEY || !env.HUNT_SECRET) {
            console.error('Worker secrets are not configured (SA_EMAIL / SA_PRIVATE_KEY / HUNT_SECRET)');
            return reply(500, { success: false, reason: 'server_config' });
        }

        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) return reply(401, { success: false, reason: 'unauthorized' });

        let user;
        try {
            user = await verifyFirebaseToken(authHeader.slice(7));
        } catch (e) {
            return reply(401, { success: false, reason: 'unauthorized' });
        }

        if (REQUIRE_APP_CHECK) {
            try {
                await verifyAppCheckToken(request.headers.get('X-Firebase-AppCheck'));
            } catch (e) {
                console.warn('App Check rejected:', e.message);
                return reply(403, { success: false, reason: 'appcheck' });
            }
        }

        try {
            if (isCode) {
                return reply(200, { success: true, code: await makeCode(env, user.sub) });
            }
            return await handleVerify(request, env, user, reply);
        } catch (e) {
            console.error('Unhandled error:', e);
            return reply(500, { success: false, reason: 'internal' });
        }
    }
};

// ─── /verify ────────────────────────────────────────────

async function handleVerify(request, env, user, reply) {
    let body;
    try {
        body = await request.json();
    } catch {
        return reply(400, { success: false, reason: 'invalid_id' });
    }

    const lodestoneId = String(body?.lodestoneId ?? '');
    if (!/^\d+$/.test(lodestoneId) || lodestoneId.length > 20) {
        return reply(400, { success: false, reason: 'invalid_id' });
    }

    const uid = user.sub;

    // すでに同じキャラクターで認証済みなら、Lodestoneへは問い合わせない
    if (user.verified === true && String(user.lid) === lodestoneId) {
        return reply(200, { success: true, characterName: String(user.cname || '') });
    }

    if (!allowAttempt(uid)) return reply(429, { success: false, reason: 'rate_limited' });

    const expectedCode = await makeCode(env, uid);

    let res;
    try {
        res = await fetch(`https://jp.finalfantasyxiv.com/lodestone/character/${lodestoneId}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Compatible; TheHuntIfritBot/1.0)',
                'Accept-Language': 'ja'
            },
            signal: AbortSignal.timeout(LODESTONE_TIMEOUT_MS)
        });
    } catch (e) {
        console.warn('Lodestone fetch failed:', e.message);
        return reply(502, { success: false, reason: 'upstream' });
    }

    if (res.status === 404) return reply(404, { success: false, reason: 'not_found' });
    if (!res.ok) return reply(502, { success: false, reason: 'upstream' });

    const html = await res.text();
    const name = sanitizeName(extractText(html, 'frame__chara__name'));
    const bio = extractText(html, 'character__selfintroduction');

    // 名前が取れない場合はページ構造が変わった可能性がある
    if (!name) return reply(502, { success: false, reason: 'parse_failed' });

    if (!bio.includes(expectedCode)) {
        return reply(422, { success: false, reason: 'code_not_found' });
    }

    try {
        await setClaims(env, uid, { verified: true, lid: lodestoneId, cname: name });
    } catch (e) {
        console.error('setClaims failed:', e.message);
        return reply(500, { success: false, reason: 'claims_failed' });
    }

    return reply(200, { success: true, characterName: name });
}

// uidごとの認証コード。uidと秘密文字列から計算するので、他人のページに載っているコードは使い回せない
async function makeCode(env, uid) {
    const key = await crypto.subtle.importKey(
        'raw', encoder.encode(env.HUNT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`hunt-verify:${uid}`)));
    const hex = Array.from(sig.slice(0, 5), b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `HUNT-${hex}`;
}

// 簡易レート制限(isolate単位のベストエフォート)
const attempts = new Map();
function allowAttempt(uid) {
    const now = Date.now();
    if (attempts.size > 5000) attempts.clear();
    const list = (attempts.get(uid) || []).filter(t => now - t < VERIFY_WINDOW_MS);
    if (list.length >= VERIFY_MAX_ATTEMPTS) {
        attempts.set(uid, list);
        return false;
    }
    list.push(now);
    attempts.set(uid, list);
    return true;
}

// ─── Lodestone HTMLの解析 ───────────────────────────────

function extractText(html, className) {
    const re = new RegExp(`class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</`, 'i');
    const m = html.match(re);
    if (!m) return '';
    return decodeEntities(m[1].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function safeCodePoint(n) {
    try { return String.fromCodePoint(n); } catch { return ''; }
}

function decodeEntities(s) {
    return s
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => safeCodePoint(parseInt(d, 10)))
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&');
}

function sanitizeName(name) {
    // eslint-disable-next-line no-control-regex
    return name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40);
}

// ─── カスタムクレームの付与(サービスアカウント) ──────────

let saToken = null;
let saTokenExp = 0;

const b64uFromString = (s) => btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const b64uFromBytes = (bytes) => b64uFromString(String.fromCharCode(...bytes));

async function getAccessToken(env) {
    const nowMs = Date.now();
    if (saToken && nowMs < saTokenExp - 300000) return saToken;

    const now = Math.floor(nowMs / 1000);
    const unsigned =
        b64uFromString(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' +
        b64uFromString(JSON.stringify({
            iss: env.SA_EMAIL,
            scope: 'https://www.googleapis.com/auth/identitytoolkit',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600
        }));

    const pem = env.SA_PRIVATE_KEY.replace(/\\n/g, '\n')
        .replace(/-----[^-]+-----/g, '')
        .replace(/\s/g, '');
    const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
        'pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned)));

    const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${unsigned}.${b64uFromBytes(sig)}`
        })
    });
    if (!r.ok) throw new Error(`oauth token request failed: ${r.status} ${await r.text()}`);

    const json = await r.json();
    saToken = json.access_token;
    saTokenExp = nowMs + (json.expires_in || 3600) * 1000;
    return saToken;
}

async function setClaims(env, uid, claims) {
    const accessToken = await getAccessToken(env);
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:update`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ localId: uid, customAttributes: JSON.stringify(claims) })
    });
    if (!r.ok) throw new Error(`accounts:update failed: ${r.status} ${await r.text()}`);
}

// ─── JWT検証(Firebase IDトークン / App Checkトークン) ───

function b64uToBytes(str) {
    let b = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    return Uint8Array.from(atob(b), c => c.charCodeAt(0));
}

// UTF-8として復号する(カスタムクレームの日本語名を正しく読むため)
function b64uToString(str) {
    return new TextDecoder().decode(b64uToBytes(str));
}

const jwksCache = new Map();

async function getJwks(url, force) {
    const now = Date.now();
    let c = jwksCache.get(url);
    if (!c) {
        c = { keys: null, expiresAt: 0, fetchedAt: 0, promise: null };
        jwksCache.set(url, c);
    }
    if (!force && c.keys && now < c.expiresAt) return c.keys;
    // 強制再取得は60秒に1回まで
    if (force && c.keys && now - c.fetchedAt < 60000) return c.keys;
    if (c.promise) return c.promise;

    c.promise = (async () => {
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Failed to fetch public keys');
            const m = (resp.headers.get('Cache-Control') || '').match(/max-age=(\d+)/);
            const maxAge = m ? parseInt(m[1], 10) : 3600;
            const data = await resp.json();
            const map = {};
            for (const k of data.keys || []) map[k.kid] = k;
            c.keys = map;
            c.fetchedAt = Date.now();
            c.expiresAt = Date.now() + maxAge * 1000;
            return map;
        } catch (e) {
            if (c.keys) return c.keys; // 取得に失敗しても、古い鍵があればそれで続行する
            throw e;
        } finally {
            c.promise = null;
        }
    })();
    return c.promise;
}

async function getKey(url, kid) {
    let keys = await getJwks(url, false);
    if (!keys[kid]) keys = await getJwks(url, true); // 鍵のローテーション対策
    return keys[kid] || null;
}

async function verifyJwt(token, keysUrl) {
    if (!token || typeof token !== 'string') throw new Error('Missing token');
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Malformed token');
    const [h, p, s] = parts;

    let header, payload;
    try {
        header = JSON.parse(b64uToString(h));
        payload = JSON.parse(b64uToString(p));
    } catch {
        throw new Error('Failed to parse token');
    }

    if (header.alg !== 'RS256') throw new Error('Invalid algorithm');
    if (!header.kid) throw new Error('Missing kid');

    const jwk = await getKey(keysUrl, header.kid);
    if (!jwk) throw new Error('Invalid kid');

    const key = await crypto.subtle.importKey(
        'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uToBytes(s), encoder.encode(`${h}.${p}`));
    if (!ok) throw new Error('Invalid signature');

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) throw new Error('Token expired');
    if (typeof payload.iat === 'number' && payload.iat > now + 60) throw new Error('Token issued in future');
    if (payload.nbf !== undefined && payload.nbf > now + 60) throw new Error('Token not yet valid');

    return payload;
}

async function verifyFirebaseToken(token) {
    const payload = await verifyJwt(token, GOOGLE_KEYS_URL);
    if (payload.aud !== PROJECT_ID) throw new Error('Invalid audience');
    if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) throw new Error('Invalid issuer');
    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 128) throw new Error('Invalid subject');
    return payload;
}

async function verifyAppCheckToken(token) {
    const payload = await verifyJwt(token, APPCHECK_KEYS_URL);
    if (payload.iss !== `https://firebaseappcheck.googleapis.com/${PROJECT_NUMBER}`) throw new Error('Invalid issuer');
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(`projects/${PROJECT_NUMBER}`)) throw new Error('Invalid audience');
    return payload;
}