# Navolume Web

Marketing site for [Navolume](https://navolume.com): the home for everything creators sell digitally.

## Local preview

```bash
python3 -m http.server 8080
```

The project is a static site served by a Cloudflare Worker. The Worker handles early-access signups at `POST /api/waitlist` and serves the remaining site assets.

## Waitlist setup (Cloudflare)

The landing-page form submits `POST /api/waitlist`. `worker.mjs` stores normalized email addresses in a Cloudflare D1 database through the `WAITLIST_DB` binding configured in `wrangler.jsonc`.

Before deploying the form, a maintainer must complete these Cloudflare steps:

1. Create the `navolume-waitlist` D1 database in the intended Cloudflare account.
2. Apply `migrations/0001_waitlist_signups.sql` to that database.
3. Set its non-secret database ID in the `WAITLIST_DB` entry in `wrangler.jsonc`.
4. Deploy the Worker.

The client and Worker both validate email addresses. The database unique constraint means repeat submissions receive a safe success response rather than duplicate rows. Do not commit credentials, API tokens, or other secrets.
