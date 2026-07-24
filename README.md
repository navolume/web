# Navolume Web

Marketing site for [Navolume](https://navolume.com): the home for everything creators sell digitally.

## Local preview

```bash
python3 -m http.server 8080
```

The project is a static site with a Cloudflare Pages Function for early-access signups.

## Waitlist setup (Cloudflare)

The landing-page form submits `POST /api/waitlist`. The function stores normalized email addresses in a Cloudflare D1 database through a binding named `WAITLIST_DB`.

Before deploying the form, a maintainer must complete these Cloudflare steps:

1. Create a D1 database in the intended Cloudflare account.
2. Apply `migrations/0001_waitlist_signups.sql` to that database (for example, with Wrangler's D1 migration support).
3. In the Cloudflare Pages project, add a D1 binding named `WAITLIST_DB` that points to the database.
4. Deploy the Pages project so `functions/api/waitlist.js` is included.

No credentials, database IDs, or secrets belong in this repository. The client validates email before submitting; the Pages Function validates it again and uses the database's unique constraint so repeat submissions receive a safe success response rather than duplicate rows.
