# Security review — 22 September 2026

Scope: application source, contact and activity APIs, notification delivery, local inbox, Cloudflare configuration, dependency advisories, and non-mutating production HTTP checks. This is a targeted review, not a penetration test or a guarantee that every vulnerability has been found.

## Changes

- Require the exact JSON media type on contact submissions; reject control characters in names/email and address delimiters in email. Notification delivery already constrained recipients and used plain text.
- Bound local inbox POST bodies to 256 bytes while streaming, canceling oversized streams before parsing or database access. Previously the entire body was buffered before its size was checked.
- Reject cross-site browser requests to the local inbox, retain same-origin POST checks and loopback hostname restrictions, and add no-sniff/no-referrer headers. The inbox remains a local operator tool, not an authenticated public service; never expose it through a tunnel or public listener.
- Add an expiry index to the rate-limit table to avoid full-table scans during request cleanup.
- Cache the GitHub fallback response for 60 seconds to reduce upstream requests during outages.
- Add restrictive headers to the worker's explicit administrative-path 404 response.

## Verification

23 tests pass, including cross-origin rejection, idempotency, rate-limit exhaustion, stored-text escaping, and cancellation of oversized request streams. Type checking, lint, and production build pass. `pnpm audit --json` reports zero known vulnerabilities in the installed dependency graph at review time. No environment/credential files were found among tracked paths.

Reviewed controls include parameterized database queries, escaped Markdown and inbox rendering, fixed upstream URLs, same-origin contact submissions, durable storage before acknowledgement, notification leases, and configured email-recipient restrictions. Public HTML serves nonce-based script CSP, framing restrictions, no-sniff, referrer policy, and HSTS.

## DNSSEC and review limits

OVH accepted registration of the verified Cloudflare signing key (2371, algorithm 13, flag 257) during this audit. The matching DS is now published. A DNSSEC query to the validating resolver at 1.1.1.1 returns NOERROR with the authenticated-data (AD) flag and an RRSIG for the domain’s A records.

The contact rate limit is per client address; it is not a distributed-abuse prevention guarantee. No load testing, account/MFA audit, credential rotation, or review of Cloudflare/OVH internal systems was performed. Existing contact records were not read during this audit. No valid test message was submitted to production.
