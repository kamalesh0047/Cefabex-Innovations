# Cefabex Innovations — Vercel migration

This archive contains a proposed **Vercel-compatible migration**, not a verified deployed release. The source environment did not provide npm registry access, so dependencies could not be installed and a production build could not be completed here. You must run `pnpm install` and `pnpm run build` locally before deploying.

## Changed
- Native Next.js commands (`next dev`, `next build`, `next start`) instead of Vinext/Cloudflare Workers build.
- D1 replaced by Turso remote SQLite (`@libsql/client`, `drizzle-orm/libsql`).
- R2 upload replaced by public Vercel Blob (`@vercel/blob`).
- ChatGPT-hosted identity replaced by password login and signed, HttpOnly, 12-hour session cookie (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`). **Use a long unique password.**
- Admin access is no longer first-user bootstrap; the configured password grants access.
- Admin images uploaded via Vercel Blob are publicly accessible by URL; do not upload sensitive documents.
- Old `/api/media/<id>` URLs from R2 cannot be migrated automatically. Re-upload those images.

## Setup
1. Create a Turso database. Generate `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the Turso console.
2. In Vercel Storage, create a Blob store and link it to this project so `BLOB_READ_WRITE_TOKEN` is injected.
3. In Vercel project Environment Variables configure `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (secret: randomly generated >=32 chars). Add for Production and Preview as appropriate.
4. In your local folder (Node 22+) run `pnpm install` to update `pnpm-lock.yaml`. The archive has a temporary install override in `vercel.json` because its lockfile predates the two new dependencies. **Commit the regenerated lockfile.** Remove the install override after regenerating.
5. With Turso credentials set in the local environment, run `pnpm db:push` to create the required SQL tables before using forms. Alternatively execute the schema statements in `drizzle/0000_burly_the_hunter.sql` from your Turso database console.
6. Run `pnpm run build`. Fix any further Next.js build errors before pushing. This migration has not been build-tested.
7. Commit and push. On Vercel select Framework: Next.js, Root: project root; leave Output Directory at default. Check deployed site `/admin` and test inquiries, event uploads and published events.

## Notes and security
- The form's anti-spam limiter is keyed by `x-forwarded-for` and only works correctly when set by a trusted hosting proxy. Consider Vercel WAF and additional bot protection for production.
- The login endpoint currently lacks distributed brute-force throttling. Configure rate-limiting/WAF on `/api/admin/login` before public production launch.
- `sameOrigin` permits requests without an Origin header, but the signed session cookie is SameSite=Strict and the login handler requires a password.
- Native Next.js may expose additional browser/server or TypeScript issues; the original code relied on Vinext. Build verification is essential.
- Deleting or replacing the old database does not transfer old D1 records. Export/import D1 data separately if needed.

## Source-preservation guarantee
The site layout, global CSS, inward-scroll CSS, and all frontend/animation source files besides `components/Admin.tsx` were copied byte-for-byte from the original user-uploaded ZIP. Admin.tsx changed only to support login outside ChatGPT hosting and the uploaded-photo selector; no animation was intentionally removed. See `FRONTEND_INTEGRITY.txt`. This does **not** certify runtime animation behavior: external dependencies and production initialization must be tested.

The existing migration cannot preserve old Cloudflare-hosted data/media without a separate export/import. Do not overwrite the only copy of your original source.
