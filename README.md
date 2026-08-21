# MCU Archive

A PIN-gated, multi-profile tracker for **110 Marvel titles** — 79 films and 31 series —
across Marvel Studios, Fox, Sony, Universal, New Line, Lionsgate, ABC, Netflix, Hulu and
Freeform. Built with Next.js (App Router), TypeScript,
Tailwind CSS, and Redis via Server Actions. Every profile keeps its own watch log.

An interactive cinematic timeline with a multi-layer cosmic parallax backdrop, glassmorphic
cards that tilt in 3D toward the cursor, per-franchise colour themes, character filtering,
a stats dashboard with unlockable achievements, and IMDb ratings and links on every film.
No external movie APIs at runtime: the whole catalog, including all IMDb metadata, is
hardcoded in `lib/catalog-*.ts`.

---

## ⚡ Making the database work on Vercel

**You do not need to create or paste a single environment variable by hand.**

1. Deploy the project to Vercel.
2. Open your **Vercel Project Dashboard → Storage → Create Database**.
3. Pick **Upstash for Redis** and connect it to this project.
4. Redeploy (or just trigger any new deployment).

That's it. Connecting the store injects `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` into every environment automatically, and the app picks them up
on the next boot. The header badge flips from **LOCAL** to **SYNCED** once it's live.

**Accounts** are provisioned the same way:

```bash
vercel integration add clerk --plan hobby_2025_08
```

Clerk's Hobby plan is free to around 10,000 monthly active users. It injects
`CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. Both integrations require you to
accept the provider's terms in the browser once — the CLI prints the link and cannot do it
for you.

> ### ℹ️ A note on "Vercel KV"
>
> The original spec for this app called for `@vercel/kv`. **Vercel KV has been sunset** —
> it is no longer a first-party product, and the old *Storage → Create KV* button no longer
> exists in the dashboard. Its official replacement is **Upstash for Redis**, available
> through the same Storage tab (now backed by the Vercel Marketplace), with the same unified
> billing and the same automatic env var injection.
>
> This app therefore uses `@upstash/redis`. Everything you were promised still holds: create
> the store from the dashboard, link it, done — **zero manual environment variables**.
> For backwards compatibility the code also accepts the legacy `KV_REST_API_URL` /
> `KV_REST_API_TOKEN` pair, so an existing legacy KV store will work unchanged.

---

## Accounts

Identity is handled by **Clerk**, installed through the Vercel Marketplace. The app never
sees or stores a password: email/password, email verification, password reset, breached
password detection and rate limiting all live on Clerk's side. All this codebase keeps is
the Clerk user id, used as the key for that person's watch list in Redis.

That is a deliberate trade. The previous 4-digit PIN system was fine while the archive was
private, but it is not something to point real users at — 10,000 combinations against a
public username list. Handing credentials to a provider whose job is credentials removes
the most dangerous thing this app could have been holding.

### Guests

The catalog is public. Anyone can browse, filter, search and tick titles without an
account. Guest ticks are held in `localStorage`, not Redis:

- The **first** tick opens a prompt explaining that the tick is saved on this device only,
  and offering to make an account. It is a nudge, not a wall — the tick already happened,
  and "keep browsing as a guest" is right there.
- A banner keeps the count visible while a guest has unsaved ticks.
- On sign-in, `mergeGuestWatchedAction` folds those ticks into the account and clears the
  local copy. The merge is **additive only**: it never unticks anything, so signing in on a
  second device with a stale guest list cannot erase progress made elsewhere.

The guest list is exposed to React through `useSyncExternalStore` rather than read into
state inside an effect. localStorage genuinely is an external store, and the server
snapshot is an empty list, so the first client render matches the server HTML.

### Claiming a pre-Clerk profile

The old PIN profiles still hold real progress, so `lib/legacy-users.ts` survives with just
enough surface to hand it over: list the profiles, verify a PIN, delete on success. A
signed-in user sees a "claim your old profile" banner while any unclaimed profile remains;
entering the right PIN merges that watch list into their account and removes the old
profile. The PIN check runs through the original scrypt comparison and the original
per-profile lockout, so it is no weaker than the login it replaces.

Creating new PIN profiles is gone. Once the last legacy profile is claimed, that file and
its `users` hash can be deleted outright.

### Where the guards actually are

`proxy.ts` runs `clerkMiddleware()` but protects **no** routes — the catalog is meant to be
public. Every write instead calls `requireUserId()` inside the Server Action, which is the
only place it matters. A guest hitting one of those is a bug or an attack, not a normal
path, so it throws rather than degrading.

> Note the filename: **Next.js 16 renamed Middleware to Proxy**, so this lives in
> `proxy.ts`, not the `middleware.ts` that most Clerk guides still show.

---

## Running locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> and create a profile.

Without Redis credentials the app falls back to an **in-process store** so `npm run dev`
and `npm run build` work with no setup at all. That fallback is not a database — it is
per-instance and resets when the server restarts. The header will show **LOCAL** to make
this obvious.

To develop against the real store, pull the vars down after linking it on Vercel:

```bash
npx vercel link
npx vercel env pull .env.local
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Auto | Injected by the Vercel Storage integration |
| `UPSTASH_REDIS_REST_TOKEN` | Auto | Injected by the Vercel Storage integration |
| `CLERK_SECRET_KEY` | Auto | Injected by the Clerk Marketplace integration |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auto | Injected by the Clerk Marketplace integration |

See `.env.example`.

---

## How syncing works

State lives in a **Redis set per profile**, `user:<userId>:watched_movies`, holding the ids of watched films (`iron-man`, `avengers-endgame`, …). Accounts live in a `users` hash.

1. Clicking a card fires the `toggleWatchedAction` Server Action.
2. It verifies the session, validates the id against the known slate, then `SADD`/`SREM`s
   the id in that user's set.
3. `revalidatePath("/")` invalidates the render, so any other device shows the change on
   its next load.
4. Locally, `useOptimistic` flips the card immediately — the round trip never blocks the UI.

---

## Project structure

```
app/
  actions.ts        Server Actions — toggles, guest merge, legacy claim
  page.tsx          Loads the catalog for a guest or a signed-in account
  layout.tsx        Fonts, metadata, parallax backdrop mount
  globals.css       Tailwind v4 theme, glass + parallax utilities, keyframes
components/
  parallax-backdrop.tsx  Multi-layer cosmic parallax (client)
  signup-prompt.tsx      First-tick nudge for guests
  claim-legacy.tsx       One-time migration of a pre-Clerk PIN profile
  pin-input.tsx          Four auto-advancing digit boxes (claim flow only)
  tracker.tsx            Views, filters, URL sync, grouping, batch actions
  progress-header.tsx    View nav, progress meter, Infinity Roulette
  filter-bar.tsx         Search, status, studios, phases, sort, density
  hero-rail.tsx          Quick-select character pills
  movie-card.tsx         Glass card, 3D tilt, poster, watched toggle
  compact-list.tsx       High-density checklist mode
  movie-modal.tsx        Full metadata panel
  roulette-modal.tsx     "What to watch next" cinematic reveal
  stats-view.tsx         Dashboard + Infinity Vault achievements
  imdb-badge.tsx         IMDb wordmark + star rating chip
lib/
  types.ts          Shared domain types
  catalog-mcu.ts    Marvel Studios films, Phase One → Six (40)
  catalog-series.ts Marvel Studios series and specials, Disney+ (20)
  catalog-marvel.ts Fox / Sony / Universal / New Line / Lionsgate films (39)
  catalog-tv.ts     Marvel Television — ABC / Netflix / Hulu / Freeform (11)
  chronology.ts     Canonical MCU in-universe order
  movies.ts         Merges the catalogs, exposes helpers
  universes.ts      Phase + franchise colour stories
  heroes.ts         Character roster for the filter pills
  posters.ts        Movie id → TMDB poster path
  redis.ts          Shared Upstash client (with in-memory dev fallback)
  kv.ts             Per-user watched sets
  guest-store.ts    Browser-held guest list (useSyncExternalStore source)
  legacy-users.ts   Pre-Clerk PIN profiles, kept for migration only
  auth.ts           Clerk session helpers
proxy.ts            Clerk middleware (Next 16 calls this Proxy)
```

---

## Views and filtering

**110 titles** — 79 films and 31 series — across Marvel Studios, 20th Century Fox, Sony,
Universal, New Line, Lionsgate, ABC, Netflix, Hulu and Freeform.

| View | What it shows |
|---|---|
| **All Marvel** | The whole catalog, grouped into franchise chapters |
| **MCU Timeline** | Marvel Studios only — films *and* Disney+ series — with a **Release order / Story order** toggle |
| **Stats & Vault** | Watch time, per-universe completion, achievement badges |

"Story order" sorts by in-universe chronology rather than release date, with films and
series interleaved — *Eyes of Wakanda* → *The First Avenger* → *Captain Marvel* → *Iron Man*
→ … The ordering is a single list in `lib/chronology.ts` and is stamped onto each title at
load, so there is one place to reorder. Placement past *Endgame* is genuinely contested —
series span months of story time and several overlap — so that file follows Marvel's own
published timeline where one exists and makes a judgement call where it does not.

### Films and series

Series are modelled one entry per *show*, not per season: Loki covers both seasons,
What If...? all three. `runtime` holds the **total** minutes across every episode, so watch
time, the runtime sort and progress counts treat both kinds identically. Cards show
"2 seasons · 12 eps" where a film shows its runtime; the modal gives the hour total.

A three-way **Everything / Movies / Series** toggle sits in the filter bar. It is deliberately
scoped rather than cosmetic: choosing **Movies** removes series from the progress meter, the
stats dashboard and the roulette pool as well as the grid — the MCU Timeline drops from
60 titles back to the original 40 films. It is linkable as `?kind=movie`.

**Where the series live.** Marvel Studios' Disney+ series carry a `phase` and sit in the MCU
universe alongside the films. The older Marvel Television shows — the ABC, Netflix, Hulu and
Freeform ones — get their own `tv` universe instead. Their canonicity is genuinely contested:
the ABC shows referenced the films constantly and were never acknowledged back, while the
Netflix ones were later pulled in explicitly, with Charlie Cox and Vincent D'Onofrio carried
straight into *She-Hulk*, *Echo* and *Born Again*. Rather than rule on it, they are visible in
All Marvel, excluded from the MCU Timeline, and filterable on their own.

**Filtering** stacks: a character pill, a text search across titles / heroes / villains /
directors / studios, a studio multi-select, watched status, and six sort orders. Chapters
collapse to a flat result list whenever a search or character filter is active, since
grouping fragments results.

**Batch actions** appear on every chapter header ("Mark all watched") and above flat result
lists, writing through one variadic `SADD`/`SREM` rather than N round trips.

**Infinity Roulette** draws a random *unwatched* film from whatever the current filter
shows, so it respects the view you are in.

### URL state

Filter state lives in the query string, so any view is linkable — `?view=mcu&order=chrono`,
`?hero=spider-man`, `?view=stats`, `?mode=compact&sort=rating-desc`. Only non-default
values are written. Updates go through `history.replaceState` rather than a router
navigation: this page is dynamically rendered, so `router.replace` would round-trip to the
server on every keystroke.

---

## Design & interaction

### Parallax

`ParallaxBackdrop` renders five fixed layers that move at different rates to build depth:

| Layer | Contents | Rate | Bounding |
|---|---|---|---|
| Ground | Cosmic radial gradient | static | — |
| Stars far | Tiling starfield, 300px tile | 0.15× | loops mod 300px |
| Stars mid | Tiling starfield, 420px tile | 0.32× | loops mod 420px |
| Stars near | Tiling starfield, 640px tile | 0.55× | loops mod 640px |
| Dust | Drifting embers, two stacked copies | 0.45× | loops mod viewport |
| Drift | Nebulae + dimensional rifts | 0.12× + velocity | clamped to 0.7 × viewport |

A **single** rAF-throttled scroll listener computes every offset and writes it as a
ready-made px value; the layers are pure CSS `transform`s, so the work stays on the
compositor and never triggers layout.

**Why the offsets are wrapped, not raw.** A layer that paints a *background* can't just be
translated by `scroll × rate` — on a long page that offset outgrows the element and exposes
a hard edge at the bottom. Each starfield offset is therefore taken **modulo its own tile
size**, so it loops seamlessly and the rate can be pushed as hard as you like. The ember
field loops the same way against viewport height, using two stacked copies.

Layers holding only positioned decoration (nebulae, rifts) paint no background and so have
no edge to tear — but at a strong rate they would scroll out of frame permanently, so their
travel is **clamped** instead.

Because every layer is `position: fixed`, the backdrop adds no page height — it cannot
cause layout shift or horizontal overflow.

**Mobile** (≤768px) scales every rate to 0.45×, re-evaluated on resize so a rotated phone
adapts without a reload. `prefers-reduced-motion` disables parallax, tilt and drift outright.

### Glassmorphism

`.glass` / `.glass-strong` provide the translucent surfaces. `.glass-edge` paints a 1px
gradient hairline using a masked pseudo-element, tinted per phase through `--edge-from` and
`--edge-to`. Cards tilt in 3D toward the cursor (max 7°) with a specular highlight that
tracks the pointer — both are gated behind `(hover: hover) and (pointer: fine)`, so touch
devices never enter a per-frame transform loop.

### Phase themes

| Phases | Colour story |
|---|---|
| 1 – 2 | Stark arc-reactor cyan against industrial steel |
| 3 | Cosmic infinity purple shot through with gold |
| 4 – 6 | Quantum red with a shifting dimensional-rift secondary |

The accent drives each card's border, glow, monogram, poster gradient, timeline node and
the "watched" state colour.

---

## IMDb metadata

Every film carries an `imdbId` and an `imdbRating`. `imdbUrl()` builds the canonical
`https://www.imdb.com/title/<id>/` link. Each card shows an IMDb chip (gold wordmark +
star rating) that is itself an external link; the hover panel and the detail modal each add
an explicit **View on IMDb** button. All external links open in a new tab with
`rel="noopener noreferrer"`.

> Ratings are a point-in-time snapshot and drift by a tenth or two over time. The three
> unreleased films have `imdbRating: null` (rendered as `NR`) and provisional IMDb ids
> worth re-checking before you rely on them.

### Poster artwork

**Posters ship as generated key art** — a phase-tinted gradient with the film's monogram in
hollow display type. Nothing is fetched from a third party at runtime, and the tiles are
sized by a fixed `2/3` aspect ratio so there is no layout shift.

To use real artwork, set `posterUrl` on that film in `lib/movies.ts`:

```ts
{ id: "iron-man", /* … */ posterUrl: "/posters/iron-man.jpg" }              // local
{ id: "iron-man", /* … */ posterUrl: "https://image.tmdb.org/t/p/w500/…" }  // remote
```

Local files go in `public/posters/`. Remote hosts must be allow-listed in
`next.config.ts` — TMDB, Wikimedia and Amazon are pre-configured. If an image fails to
load the card falls back to the generated art, so a bad URL degrades instead of breaking.

Note that Marvel poster art is copyrighted; hotlinking non-free files from Wikimedia is
against their policy, so prefer hosting your own copies under `public/posters/`.

---

## Verification

```bash
npm run build   # TypeScript + production build
npm run lint    # ESLint, zero warnings tolerated
```

Both pass clean.
