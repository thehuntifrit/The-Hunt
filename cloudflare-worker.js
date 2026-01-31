//cloudflare-worker.js

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const targetUrl = url.searchParams.get('url');

        if (!targetUrl) {
            return new Response('Missing url parameter', {
                status: 400,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
                }
            });

            const body = await response.text();

            return new Response(body, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'text/html; charset=UTF-8'
                }
            });
        } catch (e) {
            return new Response(e.message, {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }
    },
};
