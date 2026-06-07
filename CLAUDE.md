# Revive Studios Website

Marketing website for Revive Studios, an interior design company in Alpine, UT. Built with Astro 5 + Tailwind CSS 3, hosted on Cloudflare Pages with a Pages Function for the contact form. The business is run by Megan Davies and Cassidy Johnson.

> This is the canonical project guide. `AGENTS.md` points here; keep all project documentation in this file.

## Build & Deploy: always use the justfile

**Build and deployment steps go through the `justfile` recipes, never raw `npm` or `wrangler`.** Run `just` to list recipes. The recipes wrap the underlying tools and (for production) also cut a release, so calling the tools directly skips important steps.

```bash
just install            # Install dependencies
just dev                # Local dev server on http://localhost:4321
just build              # Build static site to dist/
just preview            # Build, then preview the production build locally
just serve              # Build, then run wrangler pages dev (local Pages Functions: Turnstile + Resend)
just deploy-dev         # Build + deploy to dev      (dev.revive-web.pages.dev)
just deploy-staging     # Build + deploy to staging  (staging.revive-web.pages.dev)
just deploy-production  # Release (version bump + tag) + build + deploy to production
just logs-preview       # Tail Cloudflare logs for the preview environment
just logs-production    # Tail Cloudflare logs for production
just clean              # Remove dist, .astro, node_modules
```

## Tech Stack

| Layer | Technology | Config / Location |
|-------|-----------|-------------------|
| Framework | Astro 5 (static site, minimal client JS) | `astro.config.mjs` |
| Styling | Tailwind CSS 3 with custom design tokens | `tailwind.config.mjs` |
| Fonts | Google Fonts (Cormorant Garamond + Inter) | Loaded in `src/layouts/BaseLayout.astro` |
| Content | Markdown content collections (portfolio + journal) | `src/content.config.ts`, `src/content/` |
| Images | Static files referenced by path | `public/images/` |
| Contact form | Cloudflare Pages Function | `functions/api/contact.ts` |
| Anti-spam | Cloudflare Turnstile | Widget in `src/pages/contact.astro` |
| Email | Resend API | Called from the Pages Function |
| Env management | direnv + `.env.*` files | `.envrc`, `.env`, `.env.example` |

## Architecture

- **Framework**: Astro 5, static output, minimal client JS.
- **Pages**: `src/pages/` - `index`, `about`, `services`, `process`, `contact`, plus the `portfolio/` directory.
- **Components**: `src/components/` - `Header`, `Footer`, `JournalCard` (shared via `BaseLayout`).
- **Layout**: `src/layouts/BaseLayout.astro` wraps every page with head, header, and footer.
- **Content collections**: portfolio projects and journal posts live as markdown under `src/content/` and are rendered by routes in `src/pages/portfolio/`.
- **Backend**: Cloudflare Pages Function at `functions/api/contact.ts` handles the contact form.
- **Anti-spam**: Cloudflare Turnstile widget on the contact form.
- **Email**: Resend API delivers contact form submissions.

## Design System

### Brand Palette (from original design system)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Olive | `#5f6961` | 95, 105, 97 | Primary brand: top banner, buttons, CTAs |
| Taupe 1 | `#f0eade` | 240, 234, 222 | Alternate section backgrounds (`cream-dark`) |
| Taupe 2 | `#e6e0d0` | 230, 224, 208 | Borders, dividers (`warm-gray`) |
| Taupe 3 | `#c7bead` | 199, 190, 173 | Available for subtle accents |
| Taupe 4 | `#b5ad9e` | 181, 173, 158 | Available for muted elements |
| Taupe 5 | `#a39886` | 163, 152, 134 | Available for secondary text |
| Mauve Light | `#bb9c87` | 187, 156, 135 | Warm accent option |
| Mauve Dark | `#84675a` | 132, 103, 90 | Warm accent option (darker) |

### Tailwind Tokens (in `tailwind.config.mjs`)
- **Olive** `#5f6961` / **Olive Light** `#7a847c` / **Olive Dark** `#4a534c`
- **Cream** `#faf8f5`: page background
- **Cream Dark** `#f0eade`: alternate section backgrounds (= Taupe 1)
- **Warm Gray** `#e6e0d0`: borders, dividers (= Taupe 2)
- **Charcoal** `#2c2c2c`: body text
- **Charcoal Light** `#6b6b6b`: muted/secondary text

Not all brand palette colors are in the Tailwind config yet. Add Taupe 3-5 and the Mauves to `tailwind.config.mjs` if needed.

### Typography
- **Headings**: Cormorant Garamond (serif), weights 300, 400, 600. Always use `font-serif`, typically `font-light`.
- **Body**: Inter (sans-serif), weights 300, 400, 500. Default via `src/styles/global.css`.
- Loaded via Google Fonts in the `BaseLayout` `<head>`.

### Spacing
- Section padding: `py-20 md:py-28`
- Content max-width: `max-w-7xl`
- Page headers: `pt-28 md:pt-36` to clear the sticky nav
- Generous whitespace. This is a designer's site, so let photos breathe.

### Conventions
- **Buttons/CTAs**: bordered, uppercase, tracked lettering (`text-xs uppercase tracking-[0.15em]` or `tracking-[0.2em]`).
- **Section backgrounds**: alternate between `bg-cream` (default), `bg-cream-dark`, and `bg-olive` (for CTAs) for visual rhythm.
- **Photo treatment**: `object-cover` inside `overflow-hidden` containers, with subtle `hover:scale-105` on interactive items.
- **Copy**: no em dashes anywhere on the site; avoid AI-slop phrasing.

## Key Design Decisions

- The olive banner header with the white logo is a core brand element. Keep it.
- Photos are the star. Use full-bleed sections, large aspect ratios, and subtle hover effects.
- CTA sections use an olive background with white text.

## File Structure

```
src/
├── content.config.ts           # Content collection schemas (projects, journal)
├── content/
│   ├── projects/*.md           # Portfolio projects (frontmatter: title, location, hero, gallery, ...)
│   └── journal/*.md            # Journal / blog posts
├── layouts/BaseLayout.astro    # HTML shell, fonts, meta
├── components/
│   ├── Header.astro            # Olive sticky nav + mobile menu
│   ├── Footer.astro            # Dark charcoal footer
│   └── JournalCard.astro       # Journal post preview card
├── pages/
│   ├── index.astro             # Homepage
│   ├── about.astro             # Team bios and company story
│   ├── services.astro          # Service offerings with photos
│   ├── process.astro           # Design process + FAQ
│   ├── contact.astro           # Contact form (Turnstile + JS submission)
│   └── portfolio/
│       ├── index.astro         # Portfolio landing
│       ├── all.astro           # Full project list
│       ├── [slug].astro        # Project detail (renders content/projects/*.md)
│       └── journal/
│           ├── index.astro     # Journal index
│           └── [slug].astro    # Journal post (renders content/journal/*.md)
└── styles/global.css           # Tailwind directives + base styles

functions/
└── api/contact.ts              # Pages Function: Turnstile verify -> Resend email
```

## Making Changes

### Adding a new page
1. Create `src/pages/pagename.astro`.
2. Import and wrap with `BaseLayout` from `../layouts/BaseLayout.astro`.
3. Add a nav link in `src/components/Header.astro` (both desktop and mobile nav).
4. Optionally add to footer links in `src/components/Footer.astro`.

### Adding a portfolio project or journal post
- Content lives in markdown, not in page arrays. Add a `.md` file under `src/content/projects/` (project) or `src/content/journal/` (post); the matching `[slug].astro` route renders it.
- Frontmatter must satisfy the schema in `src/content.config.ts`.
- The `add-portfolio-entry` skill walks through gathering title, location, description, images, and linkage, then creates a correctly formatted file. Prefer it for new entries.

### Modifying the header
- File: `src/components/Header.astro`.
- The olive background is `bg-olive` (`#5f6961` in `tailwind.config.mjs`).
- Logo: `public/images/logo-white.png`, white on transparent, displayed at `h-14 md:h-16`.
- The mobile menu uses a small inline `<script>` for the toggle. It is the only JS on the site.

### Modifying styles/colors
- All custom colors and fonts are defined in `tailwind.config.mjs`.
- Base styles (body background, font defaults) are in `src/styles/global.css`.

### Adding images
- Place images in `public/images/` and reference as `/images/filename.jpg` in templates.
- Use `loading="lazy"` on all images below the fold.
- Optimize before committing. Hero and large photos should be re-encoded for web (for example `magick in.jpg -strip -interlace Plane -sampling-factor 4:2:0 -quality 85 out.jpg`), kept sharp but small.

### Updating content
- Static page copy is inline in the `.astro` files.
- Team bios, services, and process steps are defined as arrays in the frontmatter of their respective pages.
- Contact info (email, phones, hours) appears in both `src/pages/contact.astro` and `src/components/Footer.astro`. Update both.

## Project Skills

This repo ships skills under `.claude/skills/`. Prefer them over doing the work by hand when they apply.

| Skill | Use it when | What it does |
|-------|-------------|--------------|
| `add-portfolio-entry` | Adding a portfolio project or a journal post | Asks plain-language questions, gathers images and details, writes a correctly formatted markdown file under `src/content/`, and runs a preview. Designed for non-technical staff. |
| `ui-ux-pro-max` | Designing, building, reviewing, or improving any UI | Design reference (styles, color palettes, font pairings, UX guidelines) with priority-based recommendations. Consult before building new components or pages. |
| `playwright-cli` | Verifying pages in a real browser | Drives a browser to load pages, check behavior, and run Playwright tests. Use to confirm a change works after editing. |

## Images

All images live in `public/images/`. Key files:
- `logo-white.png`: white logo for dark/olive backgrounds (header, footer).
- `ponderosa-kitchen.jpg`: shared hero image (homepage hero, Process step 04, Ponderosa House project).
- `photo-megan.jpg`, `photo-cassidy.jpg`: team portraits (About page).
- `piano-room-*.jpg`, `portfolio-*.jpg`, `ponderosa-*.jpg`, etc.: project photography.

## Content Source

All copy and photography were originally sourced from the existing site at revivestudiosut.com. Portfolio photography is often sourced from shared Google Photos albums.

## Contact Form

The contact form submits via JS to `/api/contact` (a Cloudflare Pages Function):

```
Browser                    Cloudflare
┌──────────────┐           ┌──────────────────────┐
│ contact.astro│           │ functions/api/        │
│              │  POST     │ contact.ts            │
│ Turnstile ───┼──────────►│                       │
│ widget       │  JSON     │ 1. Validate Turnstile │
│              │           │ 2. Send via Resend    │
│ ◄────────────┼───────────┤ 3. Return result      │
│ Show result  │  JSON     │                       │
└──────────────┘           └──────────────────────┘
```

1. User fills the form; the Turnstile widget generates a verification token.
2. JS posts form data plus the token to `/api/contact`.
3. The Function validates the Turnstile token, then sends email via the Resend API.
4. Success or error is shown inline on the page.

## Deployment

Deploys go through the justfile (which wraps `wrangler pages deploy`). There is one Cloudflare Pages project, `revive-web`; the deployment tiers are git *branches* on that project. Each deploy recipe runs a build first, then deploys `dist/`.

| Command | Cloudflare branch | URL |
|---|---|---|
| `just deploy-dev` | `dev` | `dev.revive-web.pages.dev` |
| `just deploy-staging` | `staging` | `staging.revive-web.pages.dev` |
| `just deploy-production` | `main` (production) | `revivestudiosut.com`, `www.revivestudiosut.com` |

**Workflow**: dev -> staging -> production. Validate at each stage before promoting.

**Cloudflare auth.** `wrangler` needs `CLOUDFLARE_API_TOKEN` (a Pages-scoped token with *Cloudflare Pages: Edit*) and `CLOUDFLARE_ACCOUNT_ID` (`dd7ff2e714fde32812bdc06d12a5a407`). These are **not** part of the app env files, so deploys fail with an authentication error until you set them. Add them to `.env.dev` (gitignored, direnv-loaded) or export them in your shell. The token is a secret; never commit it. Note: `wrangler whoami` reports "incorrect permissions" with a Pages-scoped token. That is expected, and the deploy still works because the account ID is supplied directly.

**`just deploy-production` also cuts a release.** Before deploying it patch-bumps `package.json`, makes a `release vX.Y.Z` commit, and creates a `vX.Y.Z` git tag. Consequences:
- It bumps the version on *every* run. Do not run it just to re-publish identical content. For that one case, run a plain `wrangler pages deploy dist --project-name revive-web --branch main` (the single documented exception to the "use just" rule).
- Afterward, push the tag yourself: `git push origin vX.Y.Z` (the recipe creates it locally only).

## Environment Management

Uses **direnv** to auto-load environment variables per deployment tier.

| File | Secrets? | Checked in? | Purpose |
|------|----------|-------------|---------|
| `.env` | No | Yes | Shared defaults (placeholder Turnstile key, destination email) |
| `.env.example` | No | Yes | Documents all required variables |
| `.env.dev` | Yes | No | Dev environment keys |
| `.env.staging` | Yes | No | Staging environment keys |
| `.env.production` | Yes | No | Production environment keys |
| `.dev.vars` | Yes | No | Wrangler local dev secrets for Pages Functions |
| `.envrc` | No | Yes | direnv loader; reads `DEPLOY_ENV` to pick the right `.env.*` file |

**Required variables**: `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`.

**Build-time vars** (`PUBLIC_`-prefixed, e.g. `PUBLIC_TURNSTILE_SITE_KEY`): exposed to client-side code by Astro at build time, loaded from the environment via direnv. Reference as `import.meta.env.PUBLIC_VAR_NAME` in `.astro` files.

**Runtime secrets** (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`): set in the Cloudflare dashboard under Workers & Pages -> revive-web -> Settings -> Environment variables. Use separate values for the Production and Preview environments.

### Adding a new secret
1. Add it to `.env.example` to document it.
2. Add it to `.env.dev`, `.env.staging`, and `.env.production` with real values.
3. If the Pages Function needs it at runtime, also set it in the Cloudflare dashboard.
4. If it is needed at build time, prefix with `PUBLIC_` and reference as `import.meta.env.PUBLIC_VAR_NAME`.
