# Markov Automotive

Website for Markov Automotive, an enthusiast mechanical shop in Springfield, Virginia. Five pages:

| Route | Page |
| --- | --- |
| `/` | Homepage: scroll-driven hero animation (pre-rendered frames) |
| `/services` | Services: scroll journey through the shop's services |
| `/workshop` | Workshop: interactive 3D car (lazy loaded) |
| `/work` | Work: cinematic flight through nine builds |
| `/contact` | Contact: service request form (Netlify Forms) |

## Stack

React 19, TypeScript, Vite 8, React Router 8, Three.js with React Three Fiber and drei, GSAP (plus `@gsap/react`), Motion, CSS Modules.
Fonts (Archivo, Inter) load from Google Fonts in `index.html`.

## Requirements

Node.js 22 or newer and npm.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # TypeScript
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
```

## Project layout

- `src/` application code (`pages/`, `sections/`, `journey/`, `scene/`, `work/`, `workshop/`, `config/`, `images/`).
- `public/` static assets served as-is: `hero/` (animation frames), `models/` and `draco/` (3D car), `workshop/` (stills), `images/` (photographs).
- `docs/*.md` design and image notes.
- All photographs are used through `src/images/registry.ts`.

## Deploying to Netlify (from GitHub)

1. Push this project to a GitHub repository.
2. In Netlify: **Add new site, Import an existing project**, choose the repository.
3. Settings (also set in `netlify.toml`): build command `npm run build`, publish directory `dist`, Node 22.
4. Deploy.

### React Router

The site uses client-side routing. `netlify.toml` rewrites every path to `index.html` (status 200), so `/services`, `/workshop`, `/work`
and `/contact` load on a direct visit or refresh. Without that rewrite those URLs return 404 on Netlify.

### Contact form (Netlify Forms)

- The visible form is React (`src/sections/contact/ServiceRequestForm.tsx`). Netlify cannot see React output, so `index.html` contains a hidden
  static copy of the form named `service-request` (honeypot `bot-field`). Netlify finds it at build time. The field names in both must match:
  `name, phone, email, year, make, model, service, emergency, details`.
- The React form posts URL-encoded data to `/` with a `form-name` field.
- Locally (`localhost`) the form never reports success: nothing is stored, and it says so.

**Test after the first deploy:**
1. Netlify dashboard, **Forms**: confirm `service-request` is listed (it appears after the first successful deploy).
2. Open `/contact` on the live site, submit a real test request, and confirm the success message.
3. Confirm the entry appears under Forms, then set up notifications (Forms, Form notifications, email) so requests reach the shop.

Delivery has not been verified yet. It can only be verified on a deployed Netlify site.

## Before going public

- **Photographs.** All ten photographs in `public/images/` came from the shop's earlier website and are pending approval from the shop owner
  (ownership and commercial usage rights are not confirmed). See `docs/image-assignments.md` and `docs/image-inventory.md`. Licence plates are
  pixelated in the served copies. Consider a private repository until they are confirmed.
- **Contact details.** No phone, email, address or hours were published, so none are shown. Add them in `src/config/contact.ts`.
