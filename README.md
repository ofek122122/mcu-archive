# MCU Archive

A private, passcode-gated tracker for every Marvel Cinematic Universe film — Phase One
through Phase Six. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Redis
via Server Actions.

An interactive cinematic timeline with a three-layer cosmic parallax backdrop,
glassmorphic cards that tilt in 3D toward the cursor, phase-specific colour themes, and
IMDb ratings and links on every film. No external movie APIs: the full 40-film slate,
including all IMDb metadata, is hardcoded in `lib/movies.ts`.

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
  actions.ts        Server Actions — login, logout, toggle watched
  page.tsx          Auth check → passcode gate or tracker
  layout.tsx        Fonts, metadata, parallax backdrop mount
  globals.css       Tailwind v4 theme, glass + parallax utilities, keyframes
components/
  parallax-backdrop.tsx  Three-layer cosmic parallax (client)
  passcode-gate.tsx      Passcode wall
  tracker.tsx            Filter state, optimistic updates, cinematic timeline
  progress-header.tsx    Sticky progress bar + completion percentage
  filter-bar.tsx         Phase and status filters
  movie-card.tsx         Glass card, 3D tilt, poster, watched toggle
  movie-modal.tsx        Full metadata panel
  imdb-badge.tsx         IMDb wordmark + star rating chip
lib/
  movies.ts         The 40-film MCU slate, phase themes, IMDb metadata
  kv.ts             Redis access (with in-memory dev fallback)
  auth.ts           Passcode hashing and session cookie
```

---

## Design & interaction

### Parallax

`ParallaxBackdrop` renders three fixed layers that scroll at different rates to build depth:

| Layer | Contents | Rate |
|---|---|---|
| Deep | Cosmic gradient + two tiling starfields | 0.035× |
| Mid | Nebulae, dimensional rifts, drifting embers | 0.11× + velocity |
| Near | Bright foreground stars | 0.20× + velocity |

A **single** rAF-throttled scroll listener writes two custom properties (`--scroll`,
`--velocity`); every layer is a pure CSS `transform`, so the work stays on the compositor
and never triggers layout. Velocity is smoothed toward the current scroll delta, which also
decays it back to rest once scrolling stops.

Because every layer is `position: fixed`, the backdrop adds no page height — it cannot
cause layout shift or horizontal overflow.

**Mobile** (≤768px) drops to roughly a third of the parallax depth and skips the
velocity term entirely. `prefers-reduced-motion` disables parallax, tilt and drift outright.

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
