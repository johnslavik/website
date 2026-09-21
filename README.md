# slawecki.dev

SvelteKit on Cloudflare Workers. Messages and 30-minute meeting requests are saved in a dedicated D1 database (`slawecki-booking`). Meeting times require an email confirmation; there is no automatic calendar availability or event creation.

## Development

```sh
pnpm install
npm run db:migrate:local
npm run dev
```

Create an ignored `.dev.vars` file containing `BOOKING_RATE_LIMIT_SALT` with a random value. Local notification delivery stays disabled unless notification sender and recipient variables are explicitly configured.

For the Cloudflare runtime, run `npm run build` and `npx wrangler dev --port 8787`.

## Deploy

```sh
npm run check
npm run lint
npm test
npm run db:migrate:remote
npm run deploy
```

`wrangler.svelte.jsonc` tells the SvelteKit adapter where to generate its handler. `wrangler.jsonc` deploys the wrapper in `worker.ts`, which also runs the email retry queue every five minutes. Keep their database binding consistent. Secrets are managed with Wrangler, never committed:

- `BOOKING_RATE_LIMIT_SALT`
- `NOTIFICATION_FROM`: an address on a verified Cloudflare Email Service sending domain
- `NOTIFICATION_TO`: the verified owner notification address

Notifications use the existing verified `powiadomienia.nawczoraj.com` sending domain and are labelled `[slawecki.dev]`. The website database and inbox remain separate from nawczoraj.

## Inbox

```sh
npm run inbox
```

Open http://127.0.0.1:8789 on this computer. This local-only Worker reads the dedicated production D1 database through your Cloudflare login. It lists the latest 100 requests and lets you mark them handled. It must not be deployed or exposed through a public tunnel. Public `/admin` URLs return 404.

## Verification

`npm test` checks origin validation, malformed inputs, honeypot handling, idempotency, changed-payload conflicts and storage failure. Browser submission tests use local D1 only and do not send real email or calendar invitations.

## Domain migration

Cloudflare routes for `slawecki.dev/*` and `www.slawecki.dev/*` are configured. Domain activation requires changing OVH nameservers to `dee.ns.cloudflare.com` and `micah.ns.cloudflare.com`, after removing the old OVH DNSSEC delegation. Restore DNSSEC with the Cloudflare key after activation. This migration is waiting on owner confirmation; the existing OVH delegation is unchanged. Fastmail MX, SPF, and all three DKIM records have been imported; DKIM records are DNS-only.

Future route deployments need Cloudflare zone-read and Workers-route-write permissions. The current CLI OAuth session lacks those scopes, so the routes were configured in the dashboard. Refresh the CLI login if a future deploy reports a routing-permission error.
