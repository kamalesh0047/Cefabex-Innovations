# Cefabex Innovations

A light editorial company website built with React, TypeScript, Three.js / WebGL, GSAP, Lenis, and a Worker-compatible Vinext application. The D1 database stores inquiries, events, reviews, and the authorized administrator. R2 stores uploaded event photographs.

## Pages

Home, About, Services, Projects, project details, Events, Reviews, Contact, Inquiry, Privacy, Admin, and a custom 404. Each page has its own route. Routes are rendered on the server so direct navigation and reloading work.

## Administration

Open `/admin` while signed in as the private site's owner, then select **Activate admin** once. The first activation binds administration to that site's stable signed-in user ID. Every administrative read and write is authorized on the server. Events and reviews support drafts, publication, editing, archiving and restoration. Event images can be uploaded or selected from supplied photographs. Published reviews require confirmed client permission. Inquiries support statuses and CSV export.

`SITE_PRIVATE_ADMIN_BOOTSTRAP=true` permits the one-time activation **only while the site is owner-private**. Activate the owner before changing the site audience; disable this environment variable before making an uninitialized site public. An initialized site rejects other signed-in accounts. No shared password or client-side admin secret is used.

## Inquiries

Server validation checks contact details, service selection, message length and consent. A honeypot and short-lived hashed IP buckets limit repeated submissions. UUID idempotency prevents duplicate records when a submission is retried. Success is shown only after the database insert succeeds. Inquiries are not emailed automatically; the administrator reviews them in the database-backed workspace.

## Content boundaries

Only supplied company information and photographs are displayed. Images retain their aspect ratio and use containment in fixed frames. Clicking photographs opens a full-image lightbox. No prices, unsupported awards, invented technologies or fabricated client reviews are included. The three selected digital projects lack approved screenshots and individual delivery information; those sections are explicitly pending. Team photographs are shown as full group photographs without guessing which portrait belongs to which name. Smart Sea Belt's 3D view is a labelled conceptual illustration, not a live navigation tool or a promise of rescue.

## Local development

Use the Sites development and publishing helpers for managed hosting. The checkout uses pnpm. Install with the project's configured package manager, then:

```sh
pnpm dev
pnpm check
pnpm build
pnpm test:integration
```

The integration checks instantiate the built Worker in an isolated Miniflare environment. They verify server-rendered routes, deep links, static assets, inquiry validation and idempotency, admin authorization, publication states, review consent, image storage and rate limits. Test records never touch the hosted database. Browser animation and responsive visual QA require a browser-enabled environment.

Database schema changes are in `db/schema.ts`. Generate new schema migrations with `pnpm db:generate`; do not edit migrations already applied to the hosted database.

## Runtime bindings

`.openai/hosting.json` declares `DB` (D1) and `BUCKET` (R2). `SITE_PRIVATE_ADMIN_BOOTSTRAP` is a runtime environment variable. Hosting credentials and runtime data are excluded from the source repository.
