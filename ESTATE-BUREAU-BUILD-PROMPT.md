# ESTATE BUREAU — Master Build Prompt (paste this into your coding LLM)

> Copy everything below the line into Claude Code / Cursor / any agentic LLM.
> It is written as a single, self-contained specification. The model should NOT
> ask clarifying questions — every decision is already made here.

---

## 0. ROLE & MISSION

You are a senior full-stack product engineer + UI designer. Build a complete,
production-grade real estate marketplace web application called **Estate Bureau**
for the Pakistani property market (primary market: DHA Lahore and surrounding
societies), from an empty folder to a deployable app.

Ship real, working, typed code — no placeholders, no `// TODO`, no lorem ipsum
in shipped components (seed data may be realistic sample data). Every page must
render, every form must submit, every filter must actually filter.

Work autonomously in phases (see §12). After each phase, run typecheck + lint +
build and fix all errors before moving on.

---

## 1. PRODUCT BRIEF

**Estate Bureau** is a modern property portal + agency website hybrid. It serves
three audiences:

1. **Buyers / renters / investors** — browse, search, filter, compare, save, and
   enquire about properties; read area guides; calculate investment returns.
2. **Agents / dealers** — list properties, manage their own inventory, receive
   and track leads from a dashboard.
3. **Admin (agency owner)** — approve listings, manage agents, publish file
   rates, write blog posts, view analytics, export leads.

**Positioning:** the most advanced, fastest, best-designed property site in
Pakistan — the feel of Zillow/Rightmove/Compass, but built natively for
Pakistani conventions (Marla/Kanal, Lac/Crore, DHA phases, plot files,
allocation vs. affidavit, WhatsApp-first contact, Urdu support).

---

## 2. COMPETITOR RESEARCH (already done — build on top of this)

Two reference sites were analysed. **Match their domain coverage, then beat them
on design, speed, and depth.**

### chohanestate.com — what it does

- Nav: Home, Plots for Sale, **File Rates**, House for Sale, House for Rent,
  Construction, About Us (Team, Careers), Projects, **Maps**, Contact Us,
  "Create a Listing".
- Homepage search: Area/Town (DHA Phases 1–12, Raya, EME, Paragon, HBFC
  Township, Cavalry Ground, Model Town, Spring Meadows, Askari, State Life,
  Cantt, Sui Gas Society), Property Type (Residential/Commercial), Size in
  Marla (5–80 Marla + apartment configs), min/max price, **Property ID search**.
- Featured properties with image, price, beds/baths, agent contact.
- **File Rates page**: tabular rates per city (DHA Lahore/Quetta/Gujranwala/
  Bahawalpur/Multan) with columns — Type (Residential/Commercial), Phase,
  Allocation/Affidavit, Area (Kanal/Marla), Demand (in Lac), Contact Person,
  Phone. Some rows are "Call for price". No dates, no charts — **we will add
  timestamps, history and charts.**
- Team contacts split by specialisation (Owner / Homes & Plots / Rentals /
  Business queries), trust stats (100+ agents, 40+ years, 20% overseas clients,
  20k+ contracts closed), blog, testimonials, corporate client logos.
- Contact: landline, per-agent numbers, email, office address, hours, WhatsApp.

### elegantdha.com — what it does

- Nav: Home, About, **Services** (Rentals commercial/residential, Construction —
  Grey Structure / Turnkey / Renovation, Architecture, Interior Design,
  Investment Consulting), **Location** (DHA Lahore 9 phases + EME, Rahbar 1–4,
  DHA Bahawalpur), **Maps** (downloadable phase maps), Other (FAQ, Contact, Blog).
- Hero: "Trusted Property Dealer in DHA Phase 5, 6, 7 & 8 — 25 Years Experience".
- Search: status (Sale/Rent), type (Residential/Apartment/Multi-Family/Villa),
  city/location, bedrooms 1–10+, price range sliders with preset tiers.
- Listing cards: image, **relative date added ("6 days ago")**, PKR price, title
  with location, beds + size, and 4 actions — Email / WhatsApp / Call / Details.
- "DHA Phases guide" with editorial callouts: "Phase 7 Best Value", "Phase 6
  Premium", "Phase 9 🔥 HOT", each linking to houses / plots / maps.
- Google Reviews widget (★4.9 · 249 reviews) with testimonial snippets.
- Floating **Property Advisor chat widget** with quick-reply chips for type/size
  and "Replies within minutes · 9am–9pm".
- Inquiry form with property type, contact details, consent checkbox.

### Estate Bureau = union of both + a modern product layer

Take: file rates, phase maps, construction/architecture/interior services, area
guides, agent directory, WhatsApp-first CTAs, Google reviews, advisor widget.
Add (neither competitor has these): **map-based search with clustering and
draw-on-map, saved searches with email/WhatsApp alerts, property comparison,
investment & mortgage calculators, price-trend charts per phase, virtual tours,
full agent + admin dashboards, Urdu/RTL, PWA, dark mode, and real SEO.**

---

## 3. TECH STACK (non-negotiable)

| Layer                  | Choice                                                                                                                   | Notes                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Framework              | **Next.js 15+, App Router, TypeScript strict**                                                                           | RSC by default; `"use client"` only where needed       |
| Styling                | **Tailwind CSS v4** + CSS variables for tokens                                                                           | no inline style objects for layout                     |
| UI kit                 | **shadcn/ui** (Radix primitives)                                                                                         | own the components in `components/ui`                  |
| Icons                  | **lucide-react**                                                                                                         |                                                        |
| Animation              | **Framer Motion** (motion/react)                                                                                         | tasteful: 150–300ms, respects `prefers-reduced-motion` |
| DB                     | **PostgreSQL** (Neon or Supabase)                                                                                        |                                                        |
| ORM                    | **Prisma** (or Drizzle if you prefer — pick one and be consistent)                                                       |                                                        |
| Auth                   | **Auth.js / NextAuth v5** — credentials + Google OAuth                                                                   | roles: USER, AGENT, ADMIN                              |
| Validation             | **Zod** shared between client and server                                                                                 | one schema per entity, inferred types                  |
| Forms                  | **React Hook Form** + `@hookform/resolvers/zod`                                                                          |                                                        |
| Server data            | **Server Actions** for mutations, **Route Handlers** for public/JSON APIs                                                |                                                        |
| Client state           | **Zustand** (compare list, recently viewed, UI prefs) + **nuqs** for URL search state                                    | filters MUST live in the URL                           |
| Data fetching (client) | **TanStack Query** for infinite scroll / map results                                                                     |                                                        |
| Images                 | **next/image** + **Cloudinary or UploadThing**                                                                           | AVIF/WebP, blur placeholders                           |
| Maps                   | **MapLibre GL + OpenStreetMap tiles** (no billing) with a swappable `MapProvider` so Mapbox/Google can be dropped in     | clustering via supercluster                            |
| Charts                 | **Recharts**                                                                                                             | price trends, admin analytics                          |
| Email                  | **Resend** + **React Email** templates                                                                                   |                                                        |
| Search                 | Postgres full-text + trigram (`pg_trgm`) first; keep a `SearchProvider` interface so Algolia/Typesense can be swapped in |                                                        |
| Content                | **MDX** for blog + area guides via `next-mdx-remote` or Contentlayer; keep an adapter so Sanity can replace it later     |                                                        |
| i18n                   | **next-intl** — `en` + `ur` with full RTL                                                                                |                                                        |
| Rate limit             | **Upstash Redis** (or in-memory fallback in dev) on all public POST routes                                               |                                                        |
| Testing                | **Vitest** (unit) + **Playwright** (e2e smoke: search, listing detail, lead submit, admin login)                         |                                                        |
| Quality                | ESLint, Prettier, `tsc --noEmit`, Husky + lint-staged                                                                    |                                                        |
| Deploy                 | **Vercel**; DB on Neon; assets on Cloudinary                                                                             | include `vercel.json` if needed                        |
| Analytics              | Vercel Analytics + a `track()` wrapper so GA4/Meta Pixel plug in                                                         |                                                        |

**Package manager:** pnpm. **Node:** 20+.

---

## 4. ARCHITECTURE & FOLDER STRUCTURE

Feature-first modules, thin route files. Routes compose features; features never
import from routes.

```
estate-bureau/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ (marketing)/            # public site
│  │  │  │  ├─ page.tsx                     # home
│  │  │  │  ├─ about/ team/ careers/
│  │  │  │  ├─ services/[slug]/             # construction, interior, architecture...
│  │  │  │  ├─ projects/[slug]/
│  │  │  │  ├─ areas/[city]/[society]/[phase]/   # area guides + phase pages
│  │  │  │  ├─ maps/                        # downloadable phase maps
│  │  │  │  ├─ file-rates/
│  │  │  │  ├─ agents/[slug]/
│  │  │  │  ├─ blog/[slug]/
│  │  │  │  ├─ contact/ faq/ privacy/ terms/
│  │  │  ├─ (properties)/
│  │  │  │  ├─ properties/            # unified search results (list + map)
│  │  │  │  ├─ properties/[slug]/     # detail page
│  │  │  │  ├─ compare/
│  │  │  │  ├─ for-sale/ for-rent/ plots/ commercial/   # SEO landing routes → same engine
│  │  │  ├─ (account)/
│  │  │  │  ├─ saved/ saved-searches/ my-enquiries/ profile/
│  │  │  ├─ (agent)/dashboard/        # agent portal
│  │  │  ├─ (admin)/admin/            # admin portal
│  │  │  ├─ layout.tsx  error.tsx  not-found.tsx  loading.tsx
│  │  ├─ api/
│  │  │  ├─ properties/route.ts       # public JSON search API (map + infinite scroll)
│  │  │  ├─ leads/route.ts  revalidate/route.ts  og/route.tsx  chat/route.ts
│  │  ├─ sitemap.ts  robots.ts  manifest.ts
│  ├─ features/
│  │  ├─ property/    { components, server/queries.ts, server/actions.ts, schema.ts, hooks, utils }
│  │  ├─ search/      { filter-bar, url-state, facets, map-search }
│  │  ├─ lead/  agent/  file-rates/  blog/  reviews/  calculators/  admin/
│  ├─ components/
│  │  ├─ ui/          # shadcn primitives
│  │  ├─ layout/      # header, mega-menu, footer, mobile-nav, floating CTAs
│  │  ├─ shared/      # PropertyCard, PriceTag, AreaBadge, EmptyState, Skeletons
│  ├─ lib/            # db.ts, auth.ts, env.ts (zod-validated), seo.ts, format.ts,
│  │                  # units.ts, currency.ts, whatsapp.ts, rate-limit.ts, analytics.ts
│  ├─ i18n/           # en.json, ur.json, routing.ts
│  ├─ styles/         # globals.css + tokens
│  └─ types/
├─ prisma/            # schema.prisma, seed.ts (≥60 realistic listings, 8 agents, rates, posts)
├─ public/            # maps/, brand/, icons/
├─ e2e/               # playwright
├─ .env.example  README.md  CONTRIBUTING.md
```

**Rules**

- All money stored as **integer PKR** (`BigInt`/`Decimal`), never floats. Format
  at the edge only, via `lib/currency.ts` → `1,25,00,000` → **"1.25 Crore"**,
  `9500000` → **"95 Lac"**. Support a `PriceDisplay` toggle (Lac/Crore vs full).
- All land area stored as **`areaSqft: number`** plus display unit. `lib/units.ts`
  converts: 1 Marla = 225 sqft (DHA/Lahore standard — make the constant
  configurable), 1 Kanal = 20 Marla = 4500 sqft. Filters accept Marla/Kanal and
  convert to sqft before querying.
- Every list query is cursor-paginated, indexed, and returns `{items, nextCursor,
totalCount, facets}`.
- `lib/env.ts` validates all env vars with Zod at boot — app fails loudly if
  misconfigured.
- No `any`. No unhandled promise. Every server action returns a discriminated
  union `{ ok: true, data } | { ok: false, error, fieldErrors? }`.

---

## 5. DATA MODEL (Prisma — implement at least this)

```prisma
User        id, name, email, phone, image, role(USER|AGENT|ADMIN), passwordHash?,
            locale, createdAt
Agent       id, userId, slug, title, bio, photo, phone, whatsapp, email,
            specialisations[] (PLOTS|HOMES|RENTALS|COMMERCIAL|INVESTMENT|CONSTRUCTION),
            languages[], yearsExperience, licenseNo, areasServed[] (→ Location),
            rating, reviewCount, isFeatured, socials Json
Property    id, refCode (e.g. EB-1042, searchable "Property ID"), slug, title,
            description, purpose(SALE|RENT), type(HOUSE|FLAT|UPPER_PORTION|
              LOWER_PORTION|PLOT|PLOT_FILE|COMMERCIAL_PLOT|SHOP|OFFICE|
              BUILDING|WAREHOUSE|FARMHOUSE|PENTHOUSE),
            category(RESIDENTIAL|COMMERCIAL), status(DRAFT|PENDING|ACTIVE|
              UNDER_OFFER|SOLD|RENTED|EXPIRED|REJECTED),
            price BigInt, priceOnRequest Boolean, rentPeriod?, currency='PKR',
            areaSqft, areaUnitDisplay, bedrooms, bathrooms, kitchens, floors,
            parkingSpaces, yearBuilt, furnishing, facing, plotNo, streetNo,
            possession(READY|UNDER_CONSTRUCTION|BALLOTED|FILE),
            fileType(ALLOCATION|AFFIDAVIT|INTIMATION|TRANSFER|NA)?,
            locationId, lat, lng, address,
            amenities[] (→ Amenity m:n), features Json,
            images (→ Media, ordered, one isCover), videoUrl, tour360Url,
            floorPlans (→ Media), brochureUrl,
            agentId, ownerId?, isFeatured, isHot, isVerified,
            viewCount, saveCount, leadCount,
            publishedAt, expiresAt, createdAt, updatedAt,
            seoTitle, seoDescription
            @@index([purpose,type,locationId,price]) @@index([lat,lng])
            + tsvector GIN index on title/description/address
Location    id, slug, name, nameUr, type(CITY|SOCIETY|PHASE|BLOCK|SECTOR),
            parentId (self-relation → Lahore > DHA > Phase 5 > Block K),
            lat, lng, polygon Json?, mapImageUrl, description(MDX), heroImage,
            avgPricePerMarla, popularityRank, isFeatured
Amenity     id, slug, name, icon, group(INDOOR|OUTDOOR|SECURITY|NEARBY|UTILITIES)
Media       id, propertyId?, url, publicId, width, height, blurDataUrl, alt,
            kind(IMAGE|FLOORPLAN|DOC|VIDEO), sortOrder
FileRate    id, city, societyId(→Location), phase, plotType(RESIDENTIAL|COMMERCIAL),
            sizeLabel ("5 Marla","1 Kanal"), areaSqft, fileType(ALLOCATION|AFFIDAVIT),
            demandPkr BigInt?, callForPrice Boolean, trend(UP|DOWN|FLAT),
            contactName, contactPhone, effectiveDate, createdAt
FileRateHistory  fileRateKey, demandPkr, effectiveDate     # powers trend charts
Lead        id, propertyId?, agentId?, name, phone, email, message,
            source(FORM|WHATSAPP|CALL|CHAT|VALUATION|CONTACT_PAGE),
            purpose, budgetMin, budgetMax, preferredLocations[],
            status(NEW|CONTACTED|QUALIFIED|VIEWING|NEGOTIATION|WON|LOST),
            assignedToId, notes(→LeadNote[]), utm Json, ip, createdAt
SavedProperty        userId, propertyId
SavedSearch          id, userId, name, queryJson, alertFrequency(OFF|INSTANT|DAILY|WEEKLY),
                     channel(EMAIL|WHATSAPP|BOTH), lastNotifiedAt
Review               id, agentId?, source(SITE|GOOGLE), authorName, rating, body,
                     isApproved, createdAt
Post (blog)          id, slug, title, excerpt, coverImage, contentMdx, tags[],
                     authorId, readingTime, publishedAt, seo Json
Project              id, slug, name, developer, status, location, priceFrom,
                     completion, gallery, amenities, brochureUrl, contentMdx
Service              id, slug, name, icon, summary, contentMdx, priceFrom, gallery
Career               id, slug, title, department, type, location, contentMdx
Inquiry/Valuation    id, type, payload Json, status
AuditLog             id, actorId, action, entity, entityId, diff Json, createdAt
```

Seed with **≥60 realistic Lahore listings** across DHA Phases 1–12, EME, Raya,
Bahria Town, Model Town, Cavalry Ground, Askari, Paragon, Valencia, Johar Town —
with correct Marla/Kanal sizes, believable Lac/Crore prices, real lat/lng inside
Lahore, 8 agents, ~40 file rates with 6 months of history, 6 blog posts, 6
services, 4 projects, 20 reviews.

---

## 6. FEATURE SPEC — PUBLIC SITE

### 6.1 Global shell

- **Sticky header** that shrinks on scroll: logo, mega-menu, locale switcher
  (EN/اردو), theme toggle, "Saved ♥ (n)", "Compare (n)", `Login`, and a primary
  **"List Your Property"** button.
- **Mega-menu** columns: _Buy_ (Houses, Plots, Plot Files, Commercial, Projects),
  _Rent_ (Houses, Portions, Flats, Shops/Offices), _Locations_ (DHA Lahore phases
  1–12 + EME + Raya, Bahria, Model Town, Askari, Rahbar 1–4, DHA Bahawalpur/
  Multan/Gujranwala/Quetta), _Services_ (Construction — Grey Structure, Turnkey,
  Renovation; Architecture; Interior Design; Investment Consulting; Property
  Management; Valuation), _Tools_ (File Rates, Maps, Price Trends, Investment
  Calculator, Mortgage Calculator, Area Guides), _Company_ (About, Team,
  Careers, Blog, Reviews, FAQ, Contact).
- **Footer**: 4 link columns, office address + hours (9am–6pm Mon–Sat), phone,
  email, newsletter form, social icons, popular-search SEO link cloud
  ("5 Marla house for sale in DHA Phase 6", etc.), trust badges.
- **Floating action rail** (mobile: bottom bar): WhatsApp, Call, Enquire,
  Back-to-top.
- **Property Advisor widget** — bottom-right chat launcher, agent avatar,
  "Replies within minutes · 9am–9pm", quick-reply chips (Buy / Rent / Plot file /
  Construction → size → budget) that collect a `Lead` and hand off to WhatsApp;
  optional LLM-backed answering via `/api/chat` (streamed) grounded only in site
  data.
- Command palette (Cmd+K / Ctrl+K): jump to any location, property refCode,
  agent, or page.

### 6.2 Homepage (in order)

1. **Hero** — full-bleed cinematic image/video of Lahore/DHA, headline, subline
   ("Trusted property experts in DHA Lahore · 25+ years"), and a **glass search
   card** with tabs `Buy | Rent | Plots | Files | Commercial`, and fields:
   Location (async multi-select with parent→child chips), Property Type, Size
   (Marla/Kanal range), Price range (Lac/Crore aware slider + presets), Beds,
   and a **"Property ID"** lookup. Submit → `/properties?...` with every filter
   in the URL.
2. **Quick stat bar** — animated counters: Active Listings, Verified Agents,
   Years of Experience, Deals Closed, Overseas Clients.
3. **Featured Properties** — carousel of premium cards.
4. **Browse by DHA Phase** — editorial grid with map thumbnails and callouts
   ("Phase 7 · Best Value", "Phase 6 · Premium", "Phase 9 · Hot"), each card
   linking to Houses / Plots / Map for that phase, plus average price per Marla.
5. **Browse by category** — Houses for Sale, Plots for Sale, Homes for Rent,
   Commercial, Plot Files, Construction.
6. **File Rates preview** — top movers of the week with up/down deltas → full page.
7. **Services** — Grey Structure, Turnkey, Renovation, Architecture, Interior,
   Investment Consulting; expandable cards with CTA.
8. **Latest Projects** with progress/completion badges.
9. **Meet the Team** — agent cards by specialisation with Call/WhatsApp.
10. **Reviews** — Google-style 4.9-star header + testimonial carousel +
    schema.org AggregateRating.
11. **Investment tools teaser** — mortgage and ROI calculators.
12. **Blog / Market Insights** — 3 latest posts.
13. **Corporate/partner logo strip**.
14. **Lead CTA band** — "Thinking of selling? Get a free valuation" → form.
15. **Newsletter + WhatsApp channel** join.

### 6.3 Search results `/properties`

- **Three view modes**: List, Grid, **Split (list + live map)**; on mobile a
  Map/List toggle.
- **Filters** (all URL-synced via nuqs, shareable, back-button safe, SSR-rendered):
  purpose, type (multi), category, location tree (multi), price min/max,
  area min/max with unit switch, beds, baths, possession, file type,
  furnishing, amenities (multi), keyword, agent, verified-only, has-video,
  has-360, added-within (24h/3d/7d/30d), and refCode.
- Sort: Newest, Price asc/desc, Area asc/desc, Price per Marla, Most Popular.
- **Facet counts** next to every filter value; "Clear all" chips row.
- Infinite scroll (TanStack Query) **plus** real `?page=` links rendered
  server-side for SEO and no-JS crawlers.
- **Map search**: clustered pins, price-bubble markers, hover-sync with the list,
  "Search as I move the map" toggle, and **draw-a-polygon** area search.
- Zero-results state that suggests widening radius/price and shows nearby matches.
- "Save this search" → alert frequency + channel.
- Skeleton loaders; sub-second perceived load.

### 6.4 Property card (shared component)

Cover image with hover-swipe gallery, purpose + verified + Hot badges,
relative added-date ("6 days ago"), **price in Lac/Crore**, price-per-Marla,
title, location breadcrumb, beds/baths/area icon row, agent avatar, and a
4-action row: **Call · WhatsApp (pre-filled message) · Email · Details**, plus
save (heart) and compare toggles.

### 6.5 Property detail `/properties/[slug]`

- Gallery: hero grid → lightbox with keyboard nav, thumbnails, image counter;
  tabs for Photos / Floor Plan / Video / 360 Tour / Map.
- Sticky summary bar on scroll (price, key specs, Enquire/WhatsApp).
- Header: title, address, refCode (copyable), price + price/Marla, badges,
  posted/updated dates, view count.
- Spec grid, full description (rich text, Urdu supported), amenities grouped
  with icons, location map + nearby places (schools, hospitals, markets,
  mosques, parks) with distances.
- **Agent card** (sticky on desktop): photo, name, specialisation, rating,
  Call / WhatsApp / Email, and an enquiry form (name, phone, email, message,
  consent) → creates a `Lead`, sends email, offers WhatsApp deep link.
- **Tools**: mortgage calculator prefilled with this price, rental-yield / ROI
  estimate, and a "price vs. phase average" mini chart.
- Share row (WhatsApp, Facebook, X, copy link), **Download PDF brochure**
  (server-generated), print stylesheet, report-listing action.
- **Similar properties** + "Recently viewed" (Zustand + localStorage).
- Full JSON-LD (`RealEstateListing`, `Offer`, `Place`, `BreadcrumbList`).

### 6.6 Locations and maps

- `/areas/lahore/dha/phase-6`: hero, MDX area guide, average price per Marla with
  **trend chart**, live counts (houses for sale / plots / rentals), top listings,
  local agents, nearby phases, downloadable **phase map (PDF/JPG)**, FAQ block.
- `/maps`: gallery of all DHA phase maps with download plus a zoomable viewer.

### 6.7 File Rates `/file-rates`

- Tabs per city (DHA Lahore / Bahawalpur / Multan / Gujranwala / Quetta).
- Sortable, filterable, **sticky-header table**: Type, Phase, Allocation/
  Affidavit, Size, Demand (Lac/Crore), change vs last update, Contact,
  Call/WhatsApp buttons. "Call for price" rows render as a CTA instead.
- **"Last updated {date}"** badge and a per-row 6-month sparkline; clicking a row
  opens a drawer with the full history chart.
- CSV export, print view, and a "Notify me when this rate changes" capture.

### 6.8 Other public pages

About (story, timeline, stats), Team/Agents directory (filter by
specialisation/area/language) plus agent profile (bio, listings, reviews,
contact, lead form), Careers with application form (CV upload), Services detail
pages (process steps, packages/pricing, gallery, FAQ, quote form), Projects,
Blog (MDX, categories, tags, reading time, TOC, related posts, share), Reviews,
FAQ (accordion + FAQPage schema), Contact (form, map embed, hours, all
departments, WhatsApp), Free Valuation tool, Mortgage and Investment
calculators, Compare page (side-by-side up to 4 with difference highlighting),
Privacy, Terms.

### 6.9 User account

Saved properties, saved searches with alert settings, my enquiries with status,
recently viewed, profile and password, notification preferences.

---

## 7. FEATURE SPEC — AGENT DASHBOARD `/dashboard`

KPI cards (active listings, views, leads, conversion), listings table
(search/filter/bulk actions, status, expiry), **multi-step listing wizard**
(Basics → Location with map pin → Details and amenities → Media drag-drop
reorder with upload progress → Pricing → Preview → Submit for approval), draft
autosave, lead inbox (assign, status pipeline kanban, notes, call/WhatsApp
shortcuts, CSV export), per-listing performance charts, profile editor.

## 8. FEATURE SPEC — ADMIN `/admin`

Overview analytics (traffic, leads by source, top locations, price trends),
**listing moderation queue** (approve/reject with reason, emails the agent),
full CRUD on properties, agents/users and roles, a locations tree editor,
amenities, **file-rates editor with bulk CSV import and history**, blog editor
with MDX preview, projects, services, careers and applications, review
moderation, testimonials, homepage content blocks (hero, stats, featured picks),
leads CRM with export, redirects, sitemap/SEO settings, audit log, and
`revalidatePath` / `revalidateTag` triggers after every publish.

---

## 9. DESIGN SYSTEM — "modern and advanced"

Do not build a generic bootstrap-looking template. Target the polish of Compass,
Rightmove, and Airbnb, with a Pakistani premium-estate character.

**Direction:** editorial luxury. Generous whitespace, large confident type,
photography-led, subtle glassmorphism on the hero search card and sticky header,
soft elevation instead of hard borders, rounded-2xl cards, micro-interactions.

**Tokens** (CSS variables in `styles/globals.css`, light + dark, both defined
explicitly; never leave a color defined only inside a media query):

```
--brand-900 #0B1F3A   deep navy      (primary surface / headers)
--brand-700 #123A6B                  (links, active states)
--accent-500 #C9A227  antique gold   (CTAs, highlights, price)
--accent-600 #A8871A
--emerald-500 #0F8A6A                (verified, success, up-trend)
--rose-500  #C0392B                  (down-trend, errors)
--ink-900 #0A0F1A  --ink-600 #4A5568  --ink-400 #8A94A6
--surface #FFFFFF  --surface-2 #F6F7F9  --line #E7EAF0
radius: 12 / 16 / 24px    shadow: sm/md/lg/xl soft, low-opacity navy
```

Dark mode: ink-950 `#070B14` base, elevated `#0E1524`, gold accent stays.

**Type:** headings `Plus Jakarta Sans` or `Sora`; body `Inter`; numerals
tabular-lining for prices; Urdu `Noto Nastaliq Urdu` with increased line-height.
Scale 12/14/16/18/20/24/30/38/48/60 with tight tracking on display sizes.

**Motion:** page transitions 200ms fade+rise; card hover lift 2px + image scale
1.03; stat counters count-up on scroll; skeleton shimmer; drawer/sheet springs.
All wrapped in `prefers-reduced-motion` guards.

**Imagery:** 4:3 cards, 16:9 heroes, `next/image` with blur placeholders and
`sizes` set correctly; never ship a layout shift.

**Responsive:** mobile-first, breakpoints 360 / 640 / 768 / 1024 / 1280 / 1536.
Mobile gets a bottom tab bar (Search, Saved, Map, Chat, Account) and sheet-based
filters. Test at 360px width — nothing may overflow horizontally.

---

## 10. NON-FUNCTIONAL REQUIREMENTS

**Performance** — Lighthouse mobile ≥ 95 across Performance/Accessibility/
Best-Practices/SEO. LCP < 2.0s, CLS < 0.05, INP < 200ms. RSC by default; client
bundles code-split; map and chart libraries dynamically imported; ISR with
`revalidate` + tag-based invalidation on publish; `next/font` self-hosted;
route-level `loading.tsx` everywhere.

**SEO** — per-route `generateMetadata`, canonical URLs, hreflang en/ur,
OpenGraph images generated at `/api/og`, `sitemap.ts` including every property,
location, agent and post, `robots.ts`, breadcrumbs, JSON-LD (Organization,
RealEstateAgent, RealEstateListing, FAQPage, BreadcrumbList, AggregateRating),
clean SEO landing routes (`/houses-for-sale-dha-phase-6-lahore`) that map onto
the same search engine, and 301 redirects table in admin.

**Accessibility** — WCAG 2.1 AA: semantic landmarks, keyboard-operable
everything (including map and gallery), visible focus rings, labelled inputs,
`aria-live` on filter result counts, 4.5:1 contrast, alt text on all imagery.

**Security** — Zod-validated inputs on every server action and route handler,
CSRF-safe mutations, RBAC checks server-side (never trust the client),
rate-limited public POSTs, honeypot + optional Cloudflare Turnstile on forms,
signed upload URLs, sanitised MDX/HTML, security headers + CSP in
`next.config.ts`, no secrets in client bundles, audit log on admin writes.

**Privacy/compliance** — cookie consent banner gating analytics, consent
checkbox on all lead forms, privacy and terms pages.

**Reliability** — `error.tsx` + `global-error.tsx`, typed API errors, Sentry-ready
hook, DB transactions for multi-write actions, idempotent seed script.

**Testing** — Vitest for `lib/units`, `lib/currency`, filter→query builder, and
Zod schemas; Playwright e2e for: search with filters, open a listing, submit a
lead, save a property, agent creates a listing, admin approves it.

---

## 11. PAKISTAN-SPECIFIC RULES (get these right — they are the differentiator)

- Area: Marla / Kanal / Sq Ft / Sq Yd, stored as sqft, displayed per user
  preference. 1 Kanal = 20 Marla = 4500 sqft (constant configurable).
- Price: PKR, formatted as Lac / Crore with the Pakistani digit grouping
  (`1,25,00,000`), plus "Call for price" support and price-per-Marla derived.
- Plot files: allocation / affidavit / intimation / transfer, balloted vs
  non-balloted, with transfer-fee and dealer-commission notes.
- Phone: normalise to `+92`, `tel:` and `wa.me` links with a pre-filled message
  containing the property refCode and title.
- Property types must include Upper Portion / Lower Portion / Farmhouse /
  Penthouse / Shop / Office / Warehouse / Building.
- Locations hierarchy: City → Society → Phase → Block → Street.
- Currency-neutral copy for overseas buyers, plus an optional USD/GBP/AED
  display toggle using a stored FX rate (admin-editable).
- Urdu locale with correct RTL layout mirroring (not just translated strings).

---

## 12. DELIVERY PLAN — build in these phases, verify each before continuing

1. **Foundation** — scaffold Next.js + TS + Tailwind + shadcn, tokens, layout
   shell (header/mega-menu/footer/theme/i18n), env validation, lint/format/CI.
2. **Data layer** — Prisma schema, migrations, seed script, query helpers,
   `units.ts` / `currency.ts` / `format.ts` with unit tests.
3. **Listings core** — PropertyCard, search engine + URL filter state, results
   page (list/grid), property detail page, similar/recently-viewed.
4. **Map & advanced search** — split view, clustering, draw search, facets,
   compare, saved searches.
5. **Leads & contact** — all forms, server actions, Resend emails, WhatsApp deep
   links, advisor widget, rate limiting.
6. **Auth & dashboards** — Auth.js, RBAC, agent dashboard + listing wizard +
   media uploads, admin panel + moderation.
7. **Content** — file rates (+history/charts/CSV), area guides, maps, blog,
   services, projects, team, careers, FAQ, reviews.
8. **Tools** — mortgage, ROI/rental yield, valuation request, price-trend charts.
9. **Polish** — animation pass, dark mode QA, Urdu/RTL QA, 360px QA, SEO/JSON-LD,
   OG images, sitemap, PWA manifest + offline shell, Lighthouse tuning.
10. **Ship** — Playwright suite green, `pnpm build` clean, README with setup +
    env + deploy steps, seeded demo accounts (admin/agent/user) documented.

---

## 13. OUTPUT RULES FOR YOU (the building model)

- Start by writing `README.md` and `.env.example`, then scaffold — so the repo is
  runnable from commit one.
- Create real files with real code. No pseudo-code, no "…rest of the component".
- Keep components under ~200 lines; extract instead of nesting deeply.
- Co-locate types with features; export shared types from `src/types`.
- Comment only where the _why_ is non-obvious (unit conversions, query builders).
- After every phase run: `pnpm typecheck && pnpm lint && pnpm build` — fix all
  errors, then print a short phase summary listing files added and what to test.
- If a decision is genuinely ambiguous, choose the option that is more standard
  for a production Next.js app, state the assumption in one line, and continue —
  **do not stop to ask.**
- Do not install any dependency not needed by a feature in this spec.
- Final deliverable: a running app at `pnpm dev` with seeded data, a green build,
  and a README that a new developer can follow end to end.

**Begin with Phase 1 now.**
