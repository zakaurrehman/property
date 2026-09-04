# Estate Bureau

A modern property portal for **DHA Lahore** and surrounding societies —
search, plot files, agents, and an agency site in one app.

## Stack

Next.js 16 (App Router, RSC) · TypeScript strict · Tailwind CSS v4 + shadcn/ui
(Radix) · PostgreSQL + Prisma 7 (driver adapters) · Zod + React Hook Form ·
nuqs · Zustand · TanStack Query · Resend + React Email (Phase 5) · next-intl
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
| `pnpm test:e2e`                | Playwright (Phase 10)               |
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
- [~] **Phase 3 — Listings core** (in progress): `PropertyCard`, `/properties`
  search (filters, sort, pagination, real `?page=` links), `/properties/[slug]`
  detail page (gallery/lightbox, spec grid, amenities, agent card, working
  enquiry form → real `Lead` row), similar properties. Still open: map
  view, saved searches, compare, recently-viewed.
- [ ] Phase 4 — Map & advanced search (split view, clustering, draw search, compare)
- [ ] Phase 5 — Leads (email/WhatsApp automation, advisor chat, rate limiting)
- [ ] Phase 6 — Auth & dashboards (Auth.js, agent dashboard, admin panel)
- [ ] Phase 7 — Content (file rates page, phase guides, blog, services, projects)
- [ ] Phase 8 — Tools (mortgage, ROI, valuation, price trends)
- [ ] Phase 9 — Polish (animation, dark mode/RTL/360px QA, SEO, PWA, Lighthouse)
- [ ] Phase 10 — Ship (Playwright green, clean build, deploy)

Most mega-menu / footer links point to routes that land in later phases and
will 404 until then — `/properties` and `/properties/[slug]` are live now.

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
