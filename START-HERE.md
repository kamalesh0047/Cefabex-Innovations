# Cefabex Innovations: start here

This archive contains the complete updated source of the deployed company website, including the scroll-controlled inward WebGL landing journey, separate pages, inquiry API, admin workspace, database schema, supplied photographs and company logo.

## Local setup

Install Node.js 24 LTS. In a terminal inside the extracted Cefabex-Innovations folder:

```sh
npm install -g pnpm@11.25.0
pnpm install
pnpm build
pnpm exec wrangler d1 execute site-creator-d1 --local --config dist/server/wrangler.json --file drizzle/0000_burly_the_hunter.sql
pnpm dev
```

Open the localhost URL printed in the terminal, normally http://localhost:5173. Keep the terminal running.

The migration command initializes the local inquiry, event, review and administrator tables. Development data and uploaded files stay local and do not copy or modify the live website's records.

## Local admin

Copy .dev.vars.example to .dev.vars before starting development. Visit /admin, use the development sign-in and activate the local administrator once. The portable development plugin supplies a local mock identity on localhost; production uses the hosting platform's authenticated identity. Local sign-in is a development convenience.

## What is included

- React and TypeScript pages with server-rendered direct routes.
- Three.js WebGL camera travel with GSAP ScrollTrigger, Lenis scrolling and page transitions.
- Real, optimized WebP photographs with full-image containment and a lightbox.
- Smart Sea Belt conceptual project presentation.
- Ten services, company story and founding team.
- Contact/social links and the database-backed project inquiry form.
- Admin editing, event/review publication, image upload, inquiry statuses and CSV export.
- Database migration, configuration, dependency lockfile and automated checks.

## Checks

```sh
pnpm check
node tests/inward-motion.mjs
pnpm test:integration
```

Run pnpm build before the integration check. Tests use an isolated database and never write to the live site.

The supplied source passed its production build, 37 integration check groups and camera/photo projection checks across eight screen sizes. Rendered browser animation and visual QA were unavailable in the build environment.

## Hosting

This is a Vinext application using React and a Next-compatible router, with a Cloudflare Worker backend, D1 database and R2 upload storage. The .openai/hosting.json file retains the existing Site identity and binding names. The source is not a frontend-only Vite app or a drop-in Vercel deployment.

For a different production host, provision D1/R2 resources, configure the DB/BUCKET bindings and implement trusted authentication for the administrator. The deployed Site handles identity at its hosting gateway. Do not trust visitor-supplied identity headers on another host.

The SITE_PRIVATE_ADMIN_BOOTSTRAP setting supports one-time administrator activation on the owner-private Site. Read README.md for the production administration workflow.

node_modules, build output, credentials, Git metadata, local runtime state and production database records are excluded from this archive. Install dependencies after extraction. All reusable source files, fonts, image assets and licenses are included.
