# MCU Archive

A private, passcode-gated tracker for every Marvel Cinematic Universe film — Phase One
through Phase Six. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Redis
via Server Actions.

A private, passcode-gated tracker for **79 Marvel films** across Marvel Studios, Fox, Sony,
Universal, New Line and Lionsgate.

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

## Access

The app is behind a single hardcoded passcode.

| | |
|---|---|
| **Default passcode** | `2099` |
| **How to change it** | Set `APP_PASSCODE` in Vercel → Settings → Environment Variables |

The session is a `httpOnly`, `sameSite=lax` cookie holding a SHA-256 digest of the passcode
(never the passcode itself), compared in constant time. It lasts 180 days. The lock button
in the top-right clears it.

Every write also re-checks the session server-side, so a leaked Server Action endpoint
can't be used to edit your log.

---

## Running locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> and enter `2099`.

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
| `APP_PASSCODE` | No | Overrides the default `2099` passcode |
| `UPSTASH_REDIS_REST_URL` | Auto | Injected by the Vercel Storage integration |
| `UPSTASH_REDIS_REST_TOKEN` | Auto | Injected by the Vercel Storage integration |

See `.env.example`.

---

## How syncing works

State lives in a **single Redis set**, `user:watched_movies`, holding the ids of watched
films (`iron-man`, `avengers-endgame`, …).

1. Clicking a card fires the `toggleWatchedAction` Server Action.
2. It verifies the session, validates the id against the known slate, then `SADD`/`SREM`s
   the id in Redis.
3. `revalidatePath("/")` invalidates the render, so any other device shows the change on
   its next load.
4. Locally, `useOptimistic` flips the card immediately — the round trip never blocks the UI.

---

## Project structure

```
app/
  actions.ts        Server Actions — login, logout, toggle, batch toggle
  page.tsx          Auth check → passcode gate or tracker
  layout.tsx        Fonts, metadata, parallax backdrop mount
  globals.css       Tailwind v4 theme, glass + parallax utilities, keyframes
components/
  parallax-backdrop.tsx  Multi-layer cosmic parallax (client)
  passcode-gate.tsx      Passcode wall
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
  catalog-mcu.ts    Marvel Studios, Phase One → Six (40 films)
  catalog-marvel.ts Fox / Sony / Universal / New Line / Lionsgate (39 films)
  movies.ts         Merges the catalogs, exposes helpers
  universes.ts      Phase + franchise colour stories
  heroes.ts         Character roster for the filter pills
  posters.ts        Movie id → TMDB poster path
  kv.ts             Redis access (with in-memory dev fallback)
  auth.ts           Passcode hashing and session cookie
```

---

## Views and filtering

**79 films** across Marvel Studios, 20th Century Fox, Sony, Universal, New Line and
Lionsgate.

| View | What it shows |
|---|---|
| **All Marvel** | The whole catalog, grouped into franchise chapters |
| **MCU Timeline** | Marvel Studios only, with a **Release order / Story order** toggle |
| **Stats & Vault** | Watch time, per-universe completion, achievement badges |

"Story order" sorts by in-universe chronology (`chronoOrder`) rather than release date —
*The First Avenger* → *Captain Marvel* → *Iron Man* → …

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
