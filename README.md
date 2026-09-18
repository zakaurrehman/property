# Estate Bureau

A modern property portal for **DHA Lahore** and surrounding societies —
search, plot files, agents, and an agency site in one app.

## Stack

Next.js 16 (App Router, RSC) · TypeScript strict · Tailwind CSS v4 + shadcn/ui
(Radix) · PostgreSQL + Prisma 7 (driver adapters) · Zod + React Hook Form ·
nuqs · Zustand · TanStack Query · MapLibre GL + OpenStreetMap + supercluster ·
Resend + React Email · Upstash Ratelimit (in-memory fallback) · next-intl
(en/ur, RTL) · Vitest + Playwright

## Getting started

```bash
pnpm install
pnpm db:dev            # starts a local Postgres via `prisma dev` (prints a DATABASE_URL — already set in .env for local dev)
pnpm db:migrate         # applies prisma/migrations
pnpm db:seed            # seeds ~80 DHA Lahore listings, agents, file rates, blog, etc.
pnpm dev
```

Open the URL it prints (defaults to [http://localhost:3000](http://localhost:3000),
but picks the next free port if that's taken).

`pnpm db:dev` runs Prisma's own local Postgres (`prisma dev`) — no Docker or
system Postgres install needed. It persists data under Prisma's local state
between restarts. For production, point `DATABASE_URL` at Neon/Supabase/
Prisma Postgres instead (see `.env.example`).

## Scripts

| Script                         | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `pnpm dev`                     | Start the dev server                |
| `pnpm build`                   | Production build                    |
| `pnpm start`                   | Run the production build            |
| `pnpm lint` / `lint:fix`       | ESLint                              |
| `pnpm format` / `format:check` | Prettier                            |
| `pnpm typecheck`               | `tsc --noEmit`                      |
| `pnpm test:unit`               | Vitest                              |
| `pnpm test:e2e`                | Playwright e2e (needs a seeded DB)  |
| `pnpm db:dev`                  | Start local Postgres (`prisma dev`) |
| `pnpm db:migrate`              | Create/apply a migration            |
| `pnpm db:generate`             | Regenerate the Prisma client        |
| `pnpm db:seed`                 | Seed demo data                      |
| `pnpm db:studio`               | Prisma Studio (visual data browser) |
| `pnpm db:reset`                | Drop + re-migrate + re-seed         |

## Environment variables

See [.env.example](.env.example) for the full list. Everything is validated
in [src/lib/env.ts](src/lib/env.ts) with Zod at boot. `DATABASE_URL` is
required; vars tied to a feature that hasn't landed yet (auth, email,
uploads, rate limiting, chat) stay optional so the app keeps building as the
project grows — see the comments in `env.ts` for which phase wires each one up.

## Project structure

```
src/
  app/[locale]/         routes, grouped by audience (marketing, properties, account, agent, admin)
  features/              feature modules: components, server/queries.ts, server/actions.ts, schema.ts
  components/ui/          shadcn/ui primitives (Radix-based)
  components/layout/      header, mega-menu, footer, mobile nav, floating CTAs
  components/shared/      PropertyCard pieces, PriceTag, AreaBadge, EmptyState, Skeletons
  lib/                    db, env, format, units, currency, whatsapp, amenity-catalog
  i18n/                   next-intl routing/config (en, ur)
  generated/prisma/       generated Prisma client (gitignored, run `pnpm db:generate`)
prisma/                  schema.prisma, migrations/, seed.ts
```

Features never import from routes; route files stay thin and compose feature
components. Money is stored as integer PKR (`BigInt`), never floats. Area is
stored as `areaSqft`; Marla/Kanal are display + filter conversions
(`src/lib/units.ts`). Prices render with Pakistani lakh/crore digit grouping
and Lac/Crore short labels (`src/lib/currency.ts`).

## Build status

This app is built in phases. Each phase ends with a green
`pnpm typecheck && pnpm lint && pnpm build`.

- [x] **Phase 1 — Foundation**: scaffold, design tokens (light/dark), layout
      shell (header/mega-menu/footer/mobile nav/floating CTAs), theme toggle,
      i18n (en/ur, RTL), command palette, env validation, ESLint/Prettier/
      Husky/lint-staged, GitHub Actions CI.
- [x] **Phase 2 — Data layer**: full Prisma schema (25 models), local Postgres
      dev DB via `prisma dev`, `units`/`currency`/`format` helpers with unit
      tests, idempotent seed script (~80 Lahore/DHA listings, 8 agents, 37
      file rates with 6-month history, reviews, blog, services, projects,
      careers, demo accounts).
- [x] **Phase 3 — Listings core**: `PropertyCard`, `/properties` search
      (filters, sort, pagination, real `?page=` links), `/properties/[slug]`
      detail page (gallery/lightbox, spec grid, amenities, agent card, working
      enquiry form → real `Lead` row), similar properties.
- [x] **Phase 4 — Map & advanced search**: list/split/map view toggle on
      `/properties`, MapLibre + OpenStreetMap tiles with client-side
      `supercluster` clustering (no worker dependency — see note below),
      hover-sync between list and map, `/compare` (up to 4, difference
      highlighting on price/area) and `/saved` backed by a Zustand +
      localStorage store via `/api/properties/{compare,saved}`. Still open:
      draw-a-polygon search, DB-backed saved searches (needs Phase 6 auth,
      since `SavedSearch` requires a user).
- [x] **Phase 5 — Leads**: property enquiry, contact (`/contact`), and free
      valuation (`/valuation`) forms all create real DB rows and email the
      agent/team + confirmation to the sender via Resend (gracefully no-ops
      and logs when `RESEND_API_KEY` isn't set yet). Property Advisor chat
      widget (quick-reply flow: intent → size → budget → contact → WhatsApp
      handoff), openable from the floating button or the mobile "Chat" tab.
      Rate limiting on every public POST (`lib/rate-limit.ts` — Upstash-backed,
      in-memory fallback for local dev) and a honeypot field on contact/
      valuation forms. Still open: LLM-grounded chat answers (`/api/chat`,
      needs `CHAT_LLM_API_KEY`), Turnstile, careers application (needs
      Phase 6's upload pipeline). The advisor widget's featured-agent lookup
      (`getAdvisorAgent()`, called from the root layout on every page) is
      wrapped in try/catch and falls back to `null` on any DB error, since a
      decorative lookup should never be able to fail the whole page render.
- [x] **Phase 6 — Auth & dashboards**: Auth.js v5 (Credentials + optional
      Google OAuth) with a Prisma adapter and JWT sessions; `/login` and
      `/register` pages, a role-aware header user menu, and RBAC route
      protection in `proxy.ts` for `/dashboard` (AGENT/ADMIN) and `/admin`
      (ADMIN only). Agent dashboard: overview stats, a listings table with
      edit/delete, and a tabbed listing wizard (basics/location/details/photos)
      with a searchable location combobox, an amenities picker, and Cloudinary
      signed uploads (falls back to pasting image URLs when `CLOUDINARY_*`
      isn't configured). New listings are created as `PENDING`; a leads inbox
      lets agents update lead status. Admin panel: platform stats, a
      moderation queue (approve → `ACTIVE`, reject → `REJECTED`), user list
      with inline role changes (auto-creates an `Agent` profile on promotion
      to AGENT), and an all-leads view. Verified end-to-end in a real browser
      (register → admin approve → agent create-listing round trip).
      Still open: careers application upload, LLM chat, Turnstile.
- [x] **Phase 7 — Content**: `/file-rates` (DHA phase-by-phase demand rates,
      grouped in an accordion, trend arrows, WhatsApp-to-contact per row).
      `/areas` + `/areas/[...slug]` — society/phase guide pages driven by the
      `Location` self-relation, with breadcrumbs and a phase picker; a
      society-level guide (e.g. DHA Lahore) aggregates listings across every
      descendant phase (`getPropertiesForLocationIds`), not just its own
      `locationId`. `/agents` + `/agents/[slug]` (added to fix a dangling
      link from the property detail page's contact card — agent profiles,
      active listings, approved reviews). `/services` + `/services/[slug]`
      and `/blog` + `/blog/[slug]` render DB-stored Markdown via
      `react-markdown` + `@tailwindcss/typography` (the seeded content is
      plain Markdown, not real MDX with embedded components, so a compiler
      wasn't needed). `/projects` + `/projects/[slug]`. Verified live in a
      browser — every index/detail route returns 200 with real seeded data
      and zero console errors. Still open: `/about`, `/careers`, `/reviews`,
      `/faq` (not part of this phase's scope, still 404).
      Bugs found and fixed: an icon resolved via a function call (instead of
      a direct object-literal lookup) still tripped the Phase 6 RSC-boundary
      lint rule even inside a Server Component; an `onClick` on a `Link`
      nested in a Radix `AccordionTrigger` violated the same Server→Client
      boundary rule on `/file-rates` (fixed by restructuring, not patching);
      a `<li key={area}>` broke on agents whose seeded `areasServed` has a
      duplicate (seed's random `pick()` can choose the same phase twice).
- [x] **Admin content management** (2026-09-18): every public content type is
      now editable from `/admin` instead of living only in the seed —
      **Listings** (all properties, status select, featured/hot/verified
      toggles, edit via the listing wizard), **File rates** (create/edit/delete;
      a price change auto-sets the trend arrow and records a `FileRateHistory`
      point), **Areas** (the city → society → phase tree, with a delete guard
      for areas that still have listings/rates/children), **Agents** (public
      profile fields, featured flag), **Blog posts** (draft/publish toggle,
      Markdown body), **Services** (icon picker, Markdown, gallery),
      **Projects**, and **Reviews** (approve/hide toggle; approving/deleting
      recomputes the agent's rating and review count). Each is a Zod schema +
      Server Actions + react-hook-form form under its `features/<type>/`
      folder, with `features/*/server/queries.ts` exposing admin list/edit
      reads. Shared bits: `components/dashboard/delete-button.tsx` (confirm
      dialog around a Server Action passed as a prop) and `page-header.tsx`.
      Edit pages bind the record id with `updateX.bind(null, id)` — an inline
      arrow from a Server Component isn't serialisable, which also fixed the
      Phase 6 listing edit page. Verified with a 29-check Playwright run
      (create → edit → public page reflects it → delete, per type). Still
      hardcoded, not admin-editable: office address/hours on `/contact` and
      the footer, and `NEXT_PUBLIC_*` contact numbers (env vars).
- [x] **Remaining routes + Phase 8 tools** (2026-09-18): every header/footer
      link now resolves. `/about`, `/privacy`, `/terms` read Markdown from a
      new `SitePage` model (edited at `/admin/pages`; built-in default copy
      in `features/site-page/defaults.ts` is the fallback when no row exists,
      so the routes never blank on an un-reseeded DB). `/faq` is a new `Faq`
      model (categories, ordering, publish toggle; `/admin/faqs`). `/reviews`
      lists approved reviews with a rating breakdown and a public "leave a
      review" form that lands hidden for approval. `/careers` +
      `/careers/[slug]` list open jobs with an application form (CV as a
      link; applications + status pipeline at `/admin/careers`). `/profile`
      edits name/phone and password. `/maps` is a 308 to
      `/properties?view=map` in `next.config.ts` — a page-level
      `redirect()` can only emit a 1s meta-refresh once the root layout has
      started streaming, which is also why `/profile` is gated in `proxy.ts`.
      Tools: `/tools/mortgage-calculator`, `/tools/investment-calculator`
      (pure functions in `lib/finance.ts`, unit-tested against known
      amortisation values) and `/tools/price-trends` (Recharts over
      `FileRateHistory`, phase filter, table view). Chart colours are
      `--chart-1..6` tokens validated for colour-blind separation on both
      surfaces; charts are forced LTR so axis text doesn't bidi-flip in Urdu.
      Verified: 80-route browser sweep (anonymous + admin), 53 unit tests,
      clean build. Still open from Phase 8: valuation _tool_ (the
      `/valuation` request form exists; an instant estimate from file rates
      does not).
- [x] **Phase 9 — Polish** (2026-09-19): **SEO** — `sitemap.xml` (request-time,
      every public route + listing/area/agent/post/service/project/career with
      en/ur hreflang pairs), `robots.txt`, per-page canonical + hreflang via
      `localizedAlternates()`, Open Graph/Twitter images on detail pages, and
      JSON-LD (`RealEstateAgent` site-wide, `RealEstateListing`, `BlogPosting`,
      `JobPosting`, `FAQPage`, `BreadcrumbList`) through a sanitising
      `<JsonLd>` — the Phase 3 listing block used raw `JSON.stringify`, an XSS
      hole for agent-entered descriptions. The public origin comes from
      `getSiteUrl()`: `NEXT_PUBLIC_SITE_URL`, else Vercel's production domain,
      so a blank variable no longer yields localhost canonicals. **PWA** —
      `manifest.ts`, generated icons (192/512/maskable/apple), SVG favicon.
      **QA** — a 360px sweep of every route in light, dark and Urdu found zero
      horizontal overflow. **Lighthouse** (desktop, production build): Best
      Practices 100 and SEO 100 across the board, Accessibility 97–100
      (from 85–91), Performance 80–94. Fixes behind those numbers: the ink
      scale was missing `ink-700/500/300` and `accent-700` even though 94
      usages existed — Tailwind v4 emits nothing for unknown colours, so all
      that "muted" text had been rendering in the body colour; every step now
      exists with AA-checked values (`ink-400`, `accent-600`, `emerald-500`
      darkened). Radix segmented-control tabs got hidden panels so
      `aria-controls` resolves; selects, pagination arrows and the phase
      picker got names; the first row of property cards is `priority` so the
      LCP image isn't lazy; MapLibre is `next/dynamic` so list view never
      ships it; validated `--chart-1..6` tokens (the earlier insert had
      silently failed on CRLF and the leftover shadcn defaults were in use).
      Not done: page-transition animation (framer-motion is only used in the
      chat widget) and the instant-valuation tool.
- [x] **Phase 10 — Ship** (2026-09-19): Playwright suite in `e2e/` (65 tests —
      every public route on desktop + mobile, RTL, redirects, SEO/PWA
      endpoints, structured data, search + filters, enquiry submission, the
      mortgage calculator, and admin login → FAQ create/publish/delete → listing
      status round trip). `pnpm test:e2e` builds and starts the app itself;
      set `PLAYWRIGHT_BASE_URL` to target a running server. CI now has an
      `e2e` job with a Postgres service (migrate → seed → build → test).
      Along the way: CI had been red since Phase 6 — `pnpm/action-setup`
      refuses a `version:` input once `package.json#packageManager` exists —
      and `generateStaticParams` on four detail routes made `next build` need
      a live database (removed; the routes are dynamic anyway). Auth.js needed
      `trustHost: true`: outside Vercel every `/api/auth/*` call failed with
      `UntrustedHost`, and the login form treated that as success — it now
      checks for Auth.js's error-page URL, as does post-registration sign-in.

Every header/footer link resolves. Run `pnpm db:seed` on a fresh database to
get the starter FAQs and site-page copy; an existing database gets the same
copy as a built-in fallback until it's edited in `/admin/pages`.

## Demo accounts

Seeded by `pnpm db:seed`, password `password123` for all:

| Role  | Email                       |
| ----- | --------------------------- |
| Admin | admin@estatebureau.pk       |
| Agent | bilal-ahmed@estatebureau.pk |
| User  | buyer@estatebureau.pk       |

Login isn't wired up yet (Phase 6) — these accounts exist in the DB with a
hashed password ready for when Auth.js lands.

## Deploy

Target: Vercel. Connect the repo, set the env vars from `.env.example`, add a
production Postgres database (Neon/Supabase/Prisma Postgres), run
`prisma migrate deploy`, and deploy.
