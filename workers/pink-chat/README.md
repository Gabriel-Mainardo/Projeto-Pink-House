# Pink Chat Worker

Proxy server-side para o assistente Pink via Cloudflare Workers.

## Variaveis necessarias

- `NVIDIA_API_KEY`
- `NVIDIA_CHAT_MODEL` opcional
- `ALLOWED_ORIGIN` opcional

## Deploy

1. `npm run cf:dev`
2. `npx wrangler secret put NVIDIA_API_KEY --config workers/pink-chat/wrangler.toml`
3. `npx wrangler secret put NVIDIA_CHAT_MODEL --config workers/pink-chat/wrangler.toml`
4. `npm run cf:deploy`

## Frontend

Defina no `.env` do site:

`VITE_PINK_CHAT_API_URL=https://<seu-worker>.workers.dev`
