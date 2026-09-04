# PASTE THIS INTO A NEW CHAT

(Everything below the line is the prompt. Companion deep-spec: ESTATE-BUREAU-BUILD-PROMPT.md)

---

You are a senior full-stack product engineer and UI designer. Build a complete,
production-grade real estate web application called **ESTATE BUREAU** — a modern
property portal for **DHA (Defence Housing Authority) Lahore** and surrounding
societies in Pakistan. Start from an empty folder and ship a running, deployable app.

Do not ask me clarifying questions. Every decision is specified below; where
something is genuinely ambiguous, pick the standard production choice, state the
assumption in one line, and keep building. Write real, working, typed code — no
placeholders, no `// TODO`, no "rest of the component omitted". Every page must
render, every filter must actually filter, every form must actually submit.

## 1. WHAT IT IS

Estate Bureau is a property marketplace + agency website hybrid, built natively
for Pakistani property conventions (Marla/Kanal, Lac/Crore, DHA phases, plot
files, WhatsApp-first contact, Urdu support). It serves three audiences:

1. **Buyers / renters / overseas investors** — search, filter, compare, save and
   enquire about DHA properties; read phase guides; calculate returns.
2. **Agents / dealers** — list properties, manage inventory, receive and work leads.
3. **Admin (agency owner)** — approve listings, manage agents, publish file rates,
   write blog posts, view analytics, export leads.

Benchmarks: match the domain coverage of chohanestate.com and elegantdha.com
(DHA phase focus, plot **file rates** tables, downloadable phase maps,
construction/interior services, agent directory, WhatsApp CTAs, Google reviews,
floating property-advisor chat), then beat them decisively on design, speed and
depth by adding: map search with clustering and draw-on-map, saved searches with
alerts, property comparison, file-rate history charts, investment and mortgage
calculators, full agent + admin dashboards, Urdu/RTL, dark mode, PWA and real SEO.

## 2. TECH STACK (non-negotiable)

- **Next.js 15+ App Router, TypeScript strict**, React Server Components by
  default; `"use client"` only where interactivity demands it
- **Tailwind CSS v4** with CSS-variable design tokens + **shadcn/ui** (Radix)
- **lucide-react** icons, **Framer Motion** for micro-interactions
- **PostgreSQL** (Neon/Supabase) + **Prisma** ORM
- **Auth.js / NextAuth v5** — credentials + Google; roles USER | AGENT | ADMIN
- **Zod** schemas shared client/server + **React Hook Form**
- **Server Actions** for mutations; **Route Handlers** for public JSON APIs
- **nuqs** for URL-synced search state, **Zustand** for compare/recently-viewed,
  **TanStack Query** for infinite scroll and map results
- **MapLibre GL + OpenStreetMap** tiles behind a swappable `MapProvider`
  interface (so Mapbox/Google can drop in), clustering via supercluster
- **Recharts** for price trends and analytics
- **next/image** + **Cloudinary or UploadThing** for uploads
- **Resend** + React Email; **next-intl** for `en` + `ur` with true RTL
- Postgres full-text + `pg_trgm` search behind a `SearchProvider` interface
- **MDX** for blog and area guides; **Upstash Redis** rate limiting on public POSTs
- **Vitest** (units, currency, query builder) + **Playwright** (e2e smoke)
- ESLint, Prettier, `tsc --noEmit`, Husky + lint-staged; **pnpm**, Node 20+
- Deploy target **Vercel**; validate all env vars with Zod in `lib/env.ts` at boot

## 3. ARCHITECTURE

Feature-first modules; thin route files that compose features. Features never
import from routes.

```
src/
  app/[locale]/
    (marketing)/  home, about, team, careers, services/[slug], projects/[slug],
                  areas/[city]/[society]/[phase], maps, file-rates,
                  agents/[slug], blog/[slug], contact, faq, privacy, terms
    (properties)/ properties (search: list+map), properties/[slug], compare,
                  for-sale, for-rent, plots, plot-files, commercial
    (account)/    saved, saved-searches, my-enquiries, profile
    (agent)/dashboard/     (admin)/admin/
  app/api/        properties, leads, chat, og, revalidate
  app/sitemap.ts  app/robots.ts  app/manifest.ts
  features/       property/ search/ lead/ agent/ file-rates/ blog/ reviews/
                  calculators/ admin/   (each: components, server/queries.ts,
                  server/actions.ts, schema.ts, hooks, utils)
  components/     ui/ (shadcn)  layout/ (header, mega-menu, footer, mobile-nav,
                  floating CTAs)  shared/ (PropertyCard, PriceTag, AreaBadge,
                  EmptyState, Skeletons)
  lib/            db, auth, env, seo, format, units, currency, whatsapp,
                  rate-limit, analytics
  i18n/ styles/ types/
prisma/ (schema.prisma, seed.ts)   public/maps/   e2e/
```

Hard rules:

- Money stored as **integer PKR** (BigInt/Decimal), never floats. Format only at
  the edge in `lib/currency.ts`: Pakistani digit grouping `1,25,00,000` and
  Lac/Crore labels (`9,500,000` → "95 Lac", `12,500,000` → "1.25 Crore").
- Area stored as **`areaSqft`** + display unit. `lib/units.ts`: 1 Marla = 225 sqft,
  1 Kanal = 20 Marla = 4500 sqft (constants configurable). Filters take
  Marla/Kanal and convert to sqft before querying.
- Every list query is cursor-paginated, indexed, and returns
  `{ items, nextCursor, totalCount, facets }`.
- No `any`. Every server action returns
  `{ ok: true, data } | { ok: false, error, fieldErrors? }`.

## 4. DATA MODEL (Prisma — implement at least this)

- **User** — id, name, email, phone, image, role(USER|AGENT|ADMIN), passwordHash?, locale
- **Agent** — userId, slug, title, bio, photo, phone, whatsapp, email,
  specialisations[](PLOTS|HOMES|RENTALS|COMMERCIAL|INVESTMENT|CONSTRUCTION),
  languages[], yearsExperience, areasServed[], rating, reviewCount, isFeatured, socials
- **Property** — refCode ("EB-1042", searchable as _Property ID_), slug, title,
  description, purpose(SALE|RENT),
  type(HOUSE|FLAT|UPPER_PORTION|LOWER_PORTION|PLOT|PLOT_FILE|COMMERCIAL_PLOT|SHOP|
  OFFICE|BUILDING|WAREHOUSE|FARMHOUSE|PENTHOUSE), category(RESIDENTIAL|COMMERCIAL),
  status(DRAFT|PENDING|ACTIVE|UNDER_OFFER|SOLD|RENTED|EXPIRED|REJECTED),
  price BigInt, priceOnRequest, rentPeriod?, areaSqft, areaUnitDisplay, bedrooms,
  bathrooms, kitchens, floors, parking, yearBuilt, furnishing, facing, plotNo,
  streetNo, possession(READY|UNDER_CONSTRUCTION|BALLOTED|FILE),
  fileType(ALLOCATION|AFFIDAVIT|INTIMATION|TRANSFER|NA)?, locationId, lat, lng,
  address, amenities[], images[] (ordered, one cover), videoUrl, tour360Url,
  floorPlans[], brochureUrl, agentId, isFeatured, isHot, isVerified, viewCount,
  saveCount, leadCount, publishedAt, expiresAt, seoTitle, seoDescription.
  Indexes on (purpose,type,locationId,price), (lat,lng), and a GIN tsvector on
  title/description/address.
- **Location** — slug, name, nameUr, type(CITY|SOCIETY|PHASE|BLOCK|SECTOR),
  parentId self-relation (Lahore → DHA → Phase 5 → Block K), lat, lng, polygon?,
  mapImageUrl, description(MDX), heroImage, avgPricePerMarla, popularityRank
- **Amenity**, **Media** (url, publicId, w/h, blurDataUrl, alt, kind, sortOrder)
- **FileRate** — city, societyId, phase, plotType, sizeLabel ("5 Marla","1 Kanal"),
  areaSqft, fileType(ALLOCATION|AFFIDAVIT), demandPkr?, callForPrice,
  trend(UP|DOWN|FLAT), contactName, contactPhone, effectiveDate
  - **FileRateHistory** (rateKey, demandPkr, effectiveDate) for trend charts
- **Lead** — propertyId?, agentId?, name, phone, email, message,
  source(FORM|WHATSAPP|CALL|CHAT|VALUATION|CONTACT_PAGE), purpose, budgetMin/Max,
  preferredLocations[], status(NEW|CONTACTED|QUALIFIED|VIEWING|NEGOTIATION|WON|LOST),
  assignedToId, notes[], utm, ip
- **SavedProperty**, **SavedSearch** (queryJson, alertFrequency, channel EMAIL|WHATSAPP|BOTH),
  **Review** (source SITE|GOOGLE, rating, body, isApproved), **Post**, **Project**,
  **Service**, **Career**, **Valuation**, **AuditLog**

**Seed realistically:** ≥60 Lahore listings across DHA Phases 1–12, EME, Raya,
plus Bahria Town, Model Town, Cavalry Ground, Askari, Paragon, Valencia, Johar
Town — correct Marla/Kanal sizes, believable Lac/Crore prices, real Lahore
lat/lng; 8 agents, ~40 file rates with 6 months of history, 6 blog posts,
6 services, 4 projects, 20 reviews, and demo admin/agent/user accounts.

## 5. PUBLIC SITE

**Shell** — sticky header that shrinks on scroll (logo, mega-menu, EN/اردو
switcher, theme toggle, Saved ♥ count, Compare count, Login, primary "List Your
Property"). Mega-menu columns: _Buy_ (Houses, Plots, Plot Files, Commercial,
Projects) · _Rent_ (Houses, Portions, Flats, Shops/Offices) · _Locations_ (DHA
Lahore Phases 1–12, EME, Raya, Rahbar 1–4, Bahria, Model Town, Askari, DHA
Bahawalpur/Multan/Gujranwala/Quetta) · _Services_ (Construction — Grey Structure,
Turnkey, Renovation; Architecture; Interior Design; Investment Consulting;
Property Management; Valuation) · _Tools_ (File Rates, Maps, Price Trends,
Investment Calculator, Mortgage Calculator, Area Guides) · _Company_ (About,
Team, Careers, Blog, Reviews, FAQ, Contact). Footer with office address, hours
(9am–6pm Mon–Sat), phone, email, newsletter, socials, and an SEO link cloud
("5 Marla house for sale in DHA Phase 6"). Floating WhatsApp/Call/Enquire rail
(bottom tab bar on mobile). Cmd+K command palette. **Property Advisor chat
widget** — agent avatar, "Replies within minutes · 9am–9pm", quick-reply chips
(Buy/Rent/Plot file/Construction → size → budget) that create a Lead and hand off
to WhatsApp, optionally answered by an LLM via `/api/chat` grounded in site data.

**Homepage, in order** — (1) cinematic hero with a glass search card, tabs
`Buy | Rent | Plots | Files | Commercial`, fields: Location multi-select
(parent→child chips), Type, Size (Marla/Kanal range), Price (Lac/Crore-aware
slider + presets), Beds, and a **Property ID** lookup — submit pushes everything
into the URL; (2) animated stat counters (Active Listings, Verified Agents, Years
of Experience, Deals Closed, Overseas Clients); (3) Featured Properties carousel;
(4) **Browse by DHA Phase** — editorial grid with map thumbnails, average price
per Marla, and callouts ("Phase 7 · Best Value", "Phase 6 · Premium", "Phase 9 ·
Hot") linking to Houses/Plots/Map for that phase; (5) browse by category;
(6) **File Rates preview** with weekly up/down movers; (7) Services cards;
(8) Latest Projects; (9) Meet the Team by specialisation with Call/WhatsApp;
(10) Reviews (4.9★ Google-style header + carousel + AggregateRating schema);
(11) calculators teaser; (12) latest blog posts; (13) partner logo strip;
(14) "Thinking of selling? Get a free valuation" lead band; (15) newsletter.

**Search `/properties`** — List / Grid / **Split (list + live map)** views;
Map/List toggle on mobile. All filters URL-synced via nuqs, shareable,
back-button safe and server-rendered: purpose, type (multi), category, location
tree (multi), price min/max, area min/max with unit switch, beds, baths,
possession, file type, furnishing, amenities, keyword, agent, verified-only,
has-video, has-360, added-within (24h/3d/7d/30d), refCode. Sort by Newest,
Price, Area, Price-per-Marla, Popularity. Facet counts beside every value;
clear-all chips. Infinite scroll **plus** real `?page=` links in SSR for crawlers.
Map: clustered price-bubble pins, hover-sync with the list, "search as I move the
map", and **draw-a-polygon** search. Helpful zero-results state. "Save this
search" with alert frequency + channel. Skeleton loaders throughout.

**Property card** — cover image with hover-swipe gallery, purpose/verified/Hot
badges, relative date ("6 days ago"), price in Lac/Crore, price-per-Marla, title,
location breadcrumb, beds/baths/area row, agent avatar, and four actions —
**Call · WhatsApp (pre-filled with refCode) · Email · Details** — plus save and
compare toggles.

**Property detail `/properties/[slug]`** — gallery with lightbox and tabs
(Photos / Floor Plan / Video / 360 Tour / Map); sticky summary bar on scroll;
header with copyable refCode, price + price-per-Marla, badges, posted/updated
dates, view count; spec grid; description (Urdu-capable); grouped amenities with
icons; location map with nearby schools/hospitals/markets/mosques/parks and
distances; **sticky agent card** (photo, rating, Call/WhatsApp/Email, enquiry
form → Lead + email + WhatsApp deep link); mortgage calculator prefilled with
this price; rental-yield/ROI estimate; "price vs phase average" mini chart;
share row; server-generated **PDF brochure download**; print stylesheet; report
listing; similar properties; recently viewed. Full JSON-LD (RealEstateListing,
Offer, Place, BreadcrumbList).

**DHA phase pages `/areas/lahore/dha/phase-6`** — hero, MDX area guide, average
price per Marla with trend chart, live counts (houses for sale / plots /
rentals), top listings, local agents, nearby phases, downloadable phase map,
FAQ block. `/maps` — every DHA phase map, zoomable viewer + download.

**File Rates `/file-rates`** — tabs per city (DHA Lahore / Bahawalpur / Multan /
Gujranwala / Quetta); sortable sticky-header table: Type, Phase,
Allocation/Affidavit, Size, Demand (Lac/Crore), change vs last update, Contact,
Call/WhatsApp. "Call for price" rows render as a CTA. **"Last updated {date}"**
badge, per-row 6-month sparkline, row click opens a drawer with full history
chart. CSV export, print view, and "notify me when this rate changes" capture.

**Also build** — About (story/timeline/stats), Agents directory (filter by
specialisation/area/language) + agent profiles, Careers + application form with
CV upload, Service detail pages (process, packages, gallery, FAQ, quote form),
Projects, Blog (MDX, tags, TOC, reading time, related posts), Reviews, FAQ
(accordion + FAQPage schema), Contact (form, map, hours, departments, WhatsApp),
Free Valuation tool, Mortgage + Investment calculators, Compare (up to 4
side-by-side with difference highlighting), Privacy, Terms. Account area: saved
properties, saved searches with alerts, my enquiries, recently viewed, profile.

## 6. AGENT DASHBOARD `/dashboard`

KPI cards (active listings, views, leads, conversion); listings table with
search/filter/bulk actions/status/expiry; **multi-step listing wizard** (Basics →
Location with map pin → Details & amenities → Media drag-drop reorder with upload
progress → Pricing → Preview → Submit for approval) with draft autosave; lead
inbox with kanban pipeline, notes, assignment, call/WhatsApp shortcuts, CSV
export; per-listing performance charts; profile editor.

## 7. ADMIN `/admin`

Analytics overview (traffic, leads by source, top locations, price trends);
**listing moderation queue** (approve/reject with reason, emails the agent);
CRUD for properties, agents/users and roles, the locations tree, amenities;
**file-rates editor with bulk CSV import and history**; blog editor with MDX
preview; projects, services, careers + applications; review moderation; homepage
content blocks (hero, stats, featured picks); leads CRM with export; redirects;
SEO settings; audit log. Every publish triggers `revalidatePath`/`revalidateTag`.

## 8. DESIGN — modern, advanced, not a generic template

Direction: **editorial luxury** — the polish of Compass/Rightmove/Airbnb with a
Pakistani premium-estate character. Generous whitespace, large confident type,
photography-led layouts, subtle glassmorphism on the hero search card and sticky
header, soft low-opacity elevation instead of hard borders, rounded-2xl cards,
tasteful micro-interactions.

Tokens as CSS variables, light **and** dark both defined explicitly (never define
a colour only inside a media query):

```
--brand-900 #0B1F3A  deep navy      --brand-700 #123A6B
--accent-500 #C9A227 antique gold   --accent-600 #A8871A
--emerald-500 #0F8A6A (verified / up-trend)   --rose-500 #C0392B (down-trend)
--ink-900 #0A0F1A  --ink-600 #4A5568  --ink-400 #8A94A6
--surface #FFFFFF  --surface-2 #F6F7F9  --line #E7EAF0
dark: base #070B14, elevated #0E1524, gold accent unchanged
radius 12/16/24px · soft navy-tinted shadows sm→xl
```

Type: headings **Plus Jakarta Sans** (or Sora), body **Inter**, tabular-lining
numerals for prices, **Noto Nastaliq Urdu** with increased line-height for `ur`.
Motion: 200ms page fade+rise, 2px card lift with 1.03 image scale on hover,
count-up stats on scroll, shimmer skeletons, spring drawers — all guarded by
`prefers-reduced-motion`. Images: 4:3 cards, 16:9 heroes, `next/image` with blur
placeholders and correct `sizes`; zero layout shift. Mobile-first at 360 / 640 /
768 / 1024 / 1280 / 1536; bottom tab bar (Search, Saved, Map, Chat, Account) and
sheet-based filters on mobile; nothing may overflow horizontally at 360px.

## 9. NON-FUNCTIONAL

- **Performance** — Lighthouse mobile ≥95 on all four categories; LCP <2.0s,
  CLS <0.05, INP <200ms. RSC by default, dynamic-import map and chart libs, ISR
  with tag invalidation on publish, self-hosted `next/font`, `loading.tsx` per route.
- **SEO** — per-route `generateMetadata`, canonicals, hreflang en/ur, OG images
  from `/api/og`, `sitemap.ts` covering every property/location/agent/post,
  `robots.ts`, breadcrumbs, JSON-LD (Organization, RealEstateAgent,
  RealEstateListing, FAQPage, BreadcrumbList, AggregateRating), and clean SEO
  landing routes like `/houses-for-sale-dha-phase-6-lahore` served by the same
  search engine.
- **Accessibility** — WCAG 2.1 AA: semantic landmarks, full keyboard operation
  (map and gallery included), visible focus rings, labelled inputs, `aria-live`
  on result counts, 4.5:1 contrast, alt text everywhere.
- **Security** — Zod validation on every action and route handler, server-side
  RBAC (never trust the client), rate-limited public POSTs, honeypot + optional
  Turnstile, signed upload URLs, sanitised MDX, CSP and security headers in
  `next.config.ts`, no secrets in client bundles, audit log on admin writes.
- **Privacy** — cookie-consent gate on analytics, consent checkbox on lead forms.
- **Reliability** — `error.tsx` + `global-error.tsx`, typed API errors,
  Sentry-ready hook, DB transactions for multi-write actions, idempotent seed.
- **Tests** — Vitest for units/currency/query-builder/Zod schemas; Playwright for
  search-with-filters, open listing, submit lead, save property, agent creates
  listing, admin approves it.

## 10. PAKISTAN / DHA RULES (these are the differentiator — get them exactly right)

- Area units Marla / Kanal / Sq Ft / Sq Yd; stored as sqft, displayed per preference.
- Prices in PKR with Lac/Crore formatting and Pakistani digit grouping, plus
  "Call for price", plus derived price-per-Marla.
- Plot files: allocation / affidavit / intimation / transfer, balloted vs
  non-balloted, with transfer-fee and dealer-commission notes.
- Phones normalised to `+92`, with `tel:` and `wa.me` links pre-filled with the
  property refCode and title.
- Property types must include Upper Portion, Lower Portion, Farmhouse, Penthouse,
  Shop, Office, Warehouse, Building.
- Location hierarchy City → Society → Phase → Block → Street, with DHA Lahore
  Phases 1–12, EME and Raya fully seeded.
- Optional USD/GBP/AED display toggle for overseas buyers using an
  admin-editable FX rate.
- Urdu locale with genuine RTL mirroring, not just translated strings.

## 11. HOW TO BUILD IT — phases, verify each before moving on

1. Foundation — scaffold, tokens, layout shell (header/mega-menu/footer/theme/i18n), env validation, lint/CI
2. Data layer — Prisma schema, migrations, seed, query helpers, `units`/`currency`/`format` + unit tests
3. Listings core — PropertyCard, search engine + URL filter state, results page, detail page, similar/recently-viewed
4. Map & advanced search — split view, clustering, draw search, facets, compare, saved searches
5. Leads — all forms, server actions, Resend emails, WhatsApp deep links, advisor widget, rate limiting
6. Auth & dashboards — Auth.js, RBAC, agent dashboard + listing wizard + uploads, admin panel + moderation
7. Content — file rates with history/charts/CSV, phase guides, maps, blog, services, projects, team, careers, FAQ, reviews
8. Tools — mortgage, ROI/rental yield, valuation request, price-trend charts
9. Polish — animation pass, dark mode QA, Urdu/RTL QA, 360px QA, SEO/JSON-LD, OG images, sitemap, PWA, Lighthouse
10. Ship — Playwright green, `pnpm build` clean, README with setup/env/deploy and demo credentials

Write `README.md` and `.env.example` first so the repo runs from commit one. Keep
components under ~200 lines. Comment only where the _why_ is non-obvious (unit
conversions, query builders). After each phase run
`pnpm typecheck && pnpm lint && pnpm build`, fix every error, then print a short
summary of files added and what I should test.

**Begin with Phase 1 now.**
