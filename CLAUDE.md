# Revive Studios Website

Interior design company website built with Astro 5 + Tailwind CSS 3.

## Quick Start

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # Static output to dist/
```

## Architecture

- **Framework**: Astro 5 (static site, minimal client JS)
- **Styling**: Tailwind CSS 3 with custom design tokens in `tailwind.config.mjs`
- **Pages**: `src/pages/` — index, about, services, portfolio, contact
- **Components**: `src/components/` — Header, Footer (shared via BaseLayout)
- **Layout**: `src/layouts/BaseLayout.astro` — wraps all pages with head, header, footer
- **Backend**: Cloudflare Pages Function at `functions/api/contact.ts` — handles contact form
- **Anti-spam**: Cloudflare Turnstile widget on the contact form
- **Email**: Resend API for delivering contact form submissions

## Design System

### Brand Palette (from original design system)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Olive | `#5f6961` | 95, 105, 97 | Primary brand — top banner, buttons, CTAs |
| Taupe 1 | `#f0eade` | 240, 234, 222 | Alternate section backgrounds (`cream-dark`) |
| Taupe 2 | `#e6e0d0` | 230, 224, 208 | Borders, dividers (`warm-gray`) |
| Taupe 3 | `#c7bead` | 199, 190, 173 | Available for subtle accents |
| Taupe 4 | `#b5ad9e` | 181, 173, 158 | Available for muted elements |
| Taupe 5 | `#a39886` | 163, 152, 134 | Available for secondary text |
| Mauve Light | `#bb9c87` | 187, 156, 135 | Warm accent option |
| Mauve Dark | `#84675a` | 132, 103, 90 | Warm accent option (darker) |

### Tailwind Tokens (in `tailwind.config.mjs`)
- **Olive** `#5f6961` / **Olive Light** `#7a847c` / **Olive Dark** `#4a534c`
- **Cream** `#faf8f5` — page background
- **Cream Dark** `#f0eade` — alternate section backgrounds (= Taupe 1)
- **Warm Gray** `#e6e0d0` — borders, dividers (= Taupe 2)
- **Charcoal** `#2c2c2c` — body text
- **Charcoal Light** `#6b6b6b` — muted/secondary text

Not all brand palette colors are in the Tailwind config yet. Add Taupe 3–5 and the Mauves to `tailwind.config.mjs` if needed.

### Typography
- **Headings**: Cormorant Garamond (serif) — weights 300, 400, 600
- **Body**: Inter (sans-serif) — weights 300, 400, 500
- Loaded via Google Fonts in BaseLayout `<head>`

### Spacing
- Section padding: `py-20 md:py-28`
- Content max-width: `max-w-7xl`
- Generous whitespace — this is a designer's site, let photos breathe

## Key Design Decisions

- The olive banner header with white logo is a core brand element — keep it
- Photos are the star — use full-bleed sections, large aspect ratios, subtle hover effects
- Button style: bordered, uppercase, tracked lettering (`tracking-[0.15em]`)
- CTA sections use olive background with white text
- Alternate sections use cream-dark background for visual rhythm

## Content Source

All copy and photography were sourced from the existing site at revivestudiosut.com. Photos are in `public/images/`. The business is run by Megan Davies and Cassidy Johnson in Alpine, UT.

## File Structure

```
src/
├── layouts/BaseLayout.astro    # HTML shell, fonts, meta
├── components/
│   ├── Header.astro            # Olive sticky nav + mobile menu
│   └── Footer.astro            # Dark charcoal footer
├── pages/
│   ├── index.astro             # Homepage
│   ├── about.astro             # Team bios, company story, design process
│   ├── services.astro          # Service offerings with photos
│   ├── portfolio.astro         # Project photo grid
│   └── contact.astro           # Contact form (Turnstile + JS submission)
└── styles/global.css           # Tailwind directives + base styles

functions/
└── api/contact.ts              # Pages Function: Turnstile verify → Resend email
```

## Images

All images live in `public/images/`. Key files:
- `logo-white.png` — white logo for dark/olive backgrounds (header, footer)
- `logo-green.png` — green logo for light backgrounds
- `hero-kitchen.jpg` — homepage hero background
- `megan-photo.jpg`, `cassidy-photo.jpg` — team portraits
- `portfolio-*.jpg`, `piano-room.png`, etc. — project photography

## Contact Form

The contact form submits via JS to `/api/contact` (a Cloudflare Pages Function). Flow:
1. User fills form, Turnstile widget generates a verification token
2. JS posts form data + token to `/api/contact`
3. Worker validates the Turnstile token, then sends email via Resend API
4. Success/error shown inline on the page

## Deployment

Deploys go through the **justfile** (which wraps `wrangler pages deploy`). There is one Cloudflare Pages project, `revive-web`; the deployment tiers are git *branches* on that project:

| Command | Cloudflare branch | URL |
|---|---|---|
| `just deploy-dev` | `dev` | `dev.revive-web.pages.dev` |
| `just deploy-staging` | `staging` | `staging.revive-web.pages.dev` |
| `just deploy-production` | `main` (production) | `revivestudiosut.com`, `www.revivestudiosut.com` |

Each target runs `npm run build` first, then deploys `dist/`.

**Cloudflare auth.** `wrangler` needs `CLOUDFLARE_API_TOKEN` (a Pages-scoped token with *Cloudflare Pages: Edit*) and `CLOUDFLARE_ACCOUNT_ID` (`dd7ff2e714fde32812bdc06d12a5a407`). These are **not** part of the app env files, so deploys fail with an authentication error until you set them — add them to `.env.dev` (gitignored, direnv-loaded) or export them in your shell. The token is a secret; never commit it. Note: `wrangler whoami` reports "incorrect permissions" with a Pages-scoped token — that's expected, and the deploy still works because the account ID is supplied directly.

**`just deploy-production` also cuts a release.** Before deploying it patch-bumps `package.json`, makes a `release vX.Y.Z` commit, and creates a `vX.Y.Z` git tag. Consequences:
- It bumps the version on *every* run — don't run it just to re-publish identical content (for that, run a plain `wrangler pages deploy dist --project-name revive-web --branch main`).
- Afterward, push the tag yourself: `git push origin vX.Y.Z` (the recipe creates it locally only).

## Environment Management

Uses **direnv** to auto-load environment variables per deployment tier.

```
.env                  # Shared defaults (checked in, no secrets)
.env.dev              # Dev secrets (gitignored)
.env.staging          # Staging secrets (gitignored)
.env.production       # Production secrets (gitignored)
.dev.vars             # Wrangler local dev secrets for Pages Functions (gitignored)
.envrc                # direnv loader — reads DEPLOY_ENV to pick the right file
.env.example          # Documents all required variables (checked in)
```

**Required variables**: `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`

`PUBLIC_`-prefixed vars are exposed to client-side code by Astro at build time. Server-side secrets (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`) are set as Cloudflare Pages environment variables via the dashboard, separated into Production and Preview environments.
