# Pixel Web Developers — Immersive 3D Agency

An original, open-world **drive-to-explore** agency website. Visitors pilot a
stylized neon car through a cyberpunk city and discover every section by
driving into glowing **stations**. Inspired by the *idea* of a 3D driving
portfolio — built from scratch, no copied assets or layouts.

> **Tagline:** We Build Digital Experiences That Move.

---

## Tech stack

| Layer        | Tech                                              |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 14 (App Router) + React 18 + TypeScript   |
| 3D           | Three.js, React Three Fiber, Drei, postprocessing |
| State        | Zustand                                           |
| Animation    | GSAP-ready + Framer Motion (UI)                   |
| Styling      | Tailwind CSS (glassmorphism + neon utilities)     |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

Requires Node 18.18+ (tested on Node 24).

---

## How it works

- **Car is the navigation.** No nav menu — you drive to each zone.
- **Arcade physics** (`components/car/CarController.tsx`): smooth accel/brake,
  speed-scaled steering, grip + handbrake drift, soft circular world boundary.
  Frame-rate independent (delta-clamped) and runs entirely in `useFrame` — no
  heavy physics engine.
- **Spring follow camera** (`FollowCamera.tsx`): damped third-person chase,
  cinematic top-down angle, speed-based pull-back + FOV punch, mouse look,
  and a cinematic zoom when you arrive at a station.
- **Proximity system**: the controller measures distance to each station every
  frame and updates the store; stopping inside a ring opens that zone's panel.

### Controls

| Input            | Action                |
| ---------------- | --------------------- |
| `W` / `↑`        | Accelerate            |
| `S` / `↓`        | Brake / reverse       |
| `A` `D` / `← →`  | Steer                 |
| `Space`          | Handbrake drift       |
| Mouse            | Camera look           |
| Mobile           | On-screen joystick + DRIFT button |

### Zones (stations)

`Hero garage · Services Hub · Portfolio District · About Tower · Process Road ·
Testimonial Park · Contact Portal` — all defined in `utils/config.ts`.

---

## Project structure

```
app/                 Next.js App Router (layout, page, robots, sitemap, globals)
components/
  PixelWorld.tsx     Top-level client orchestrator (canvas + all UI)
  3d/                Canvas (Experience) + postprocessing (Effects)
  car/               CarModel, CarController (physics), FollowCamera, TireTrail
  world/             Environment, Ground, Roads, Buildings, Platforms, World
  stations/          StationMarker, ServiceBillboard, ShowroomPod, Landmarks
  ui/                LoadingScreen, HeroOverlay, HUD, StationPanel, Modals,
                     ContactForm, MobileControls, SeoContent, CountUp
hooks/               useControls (keyboard + shared control state)
store/               useGameStore (Zustand), carState (non-reactive car state)
utils/               config (all content/data), types, math helpers
public/              models / textures / audio (see folder READMEs)
```

## Performance

- Instanced meshes for the 140-building skyline and the tire-trail pool.
- Procedural car + canvas-generated road textures → near-zero asset weight.
- `AdaptiveDpr` + `AdaptiveEvents`, device-aware DPR clamp and a lighter
  postprocessing stack on mobile (`isMobile` in the store).
- Delta-clamped `useFrame` loops; HUD speed throttled; non-reactive car state
  (`store/carState.ts`) avoids React re-renders during driving.

## SEO

- Full server-rendered, crawler-readable fallback copy in
  `components/ui/SeoContent.tsx` (visually hidden, not `display:none`).
- Rich metadata + Open Graph/Twitter in `app/layout.tsx`,
  `ProfessionalService` JSON-LD, plus `app/robots.ts` and `app/sitemap.ts`.
- Add an `public/og-image.png` (1200×630) for social cards.

## Customizing content

All copy lives in **`utils/config.ts`** — stations, services, projects,
testimonials, stats, timeline, process steps and contact budgets. Edit there;
the 3D world and every UI panel update automatically.

## Wiring the contact form

`components/ui/ContactForm.tsx` validates and shows the "message sent"
animation but has **no backend**. Point `submit()` at a Next.js Route Handler
(`app/api/contact/route.ts`) or a service like Resend/Formspree.

## Deploying to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. On [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Framework preset auto-detects **Next.js**. Defaults are correct:
   - Build command: `next build`
   - Output: `.next`
   - Install: `npm install`
4. (Optional) add env vars for your contact backend.
5. **Deploy.** Vercel handles SSR, static optimization and edge caching.

CLI alternative:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

Update `SITE_URL` in `app/layout.tsx`, `app/robots.ts` and `app/sitemap.ts`
to your real domain before launch.

---

## Asset list

| Asset | Status | Notes |
| ----- | ------ | ----- |
| Car model | ✅ Procedural | Built from primitives in `CarModel.tsx`. Swap for a GLB via `public/models/README.md`. |
| World geometry | ✅ Procedural | Ground, neon grid, roads, instanced skyline, platforms, landmarks. |
| Road light-trail texture | ✅ Generated | Canvas texture created at runtime in `Roads.tsx`. |
| Fonts | ✅ Included | Orbitron (display) + Rajdhani (body) via `next/font/google`. |
| `og-image.png` | ⬜ To add | 1200×630 social card → `public/og-image.png`. |
| `favicon.ico` | ⬜ To add | Drop in `app/` or `public/`. |
| Audio | ⬜ Optional | Engine/ambient/UI clips → `public/audio` (mute toggle already wired). |
| Textures | ⬜ Optional | Only if you extend the environment → `public/textures`. |

All current visuals are generated in-code, so the site runs with **zero
external 3D assets** out of the box.
```
