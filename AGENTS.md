# Agents Guide — Revive Studios Website

## Project Overview

Marketing website for Revive Studios, an interior design company in Alpine, UT. Built with Astro 5 + Tailwind CSS 3, hosted on Cloudflare Pages with a Pages Function for the contact form.

## Tech Stack

| Layer | Technology | Config File |
|-------|-----------|-------------|
| Framework | Astro 5 | `astro.config.mjs` |
| Styling | Tailwind CSS 3 | `tailwind.config.mjs` |
| Fonts | Google Fonts (Cormorant Garamond + Inter) | Loaded in `src/layouts/BaseLayout.astro` |
| Images | Static files in `public/images/` | Referenced by path in templates |
| Contact form | Cloudflare Pages Function | `functions/api/contact.ts` |
| Anti-spam | Cloudflare Turnstile | Widget in `src/pages/contact.astro` |
| Email | Resend API | Called from Pages Function |
| Env management | direnv + `.env.*` files | `.envrc`, `.env`, `.env.example` |

## Commands

```bash
npm run dev               # Start local dev server on port 4321
npm run build             # Build static site to dist/
npm run preview           # Preview production build locally
npm run deploy:dev        # Build + deploy to dev (dev.revive-web.pages.dev)
npm run deploy:staging    # Build + deploy to staging (staging.revive-web.pages.dev)
npm run deploy:production # Build + deploy to production (revive-web.pages.dev / revivestudiosut.com)
```

## Making Changes

### Adding a new page
1. Create `src/pages/pagename.astro`
2. Import and wrap with `BaseLayout` from `../layouts/BaseLayout.astro`
3. Add a nav link in `src/components/Header.astro` (both desktop and mobile nav)
4. Optionally add to footer links in `src/components/Footer.astro`

### Modifying the header
- File: `src/components/Header.astro`
- The olive background color is `bg-olive` (defined as `#5f6961` in tailwind.config.mjs)
- Logo: `public/images/logo-white.png` — white on transparent, displayed at `h-14 md:h-16`
- Mobile menu uses a small inline `<script>` for toggle — the only JS on the site

### Modifying styles/colors
- All custom colors and fonts are defined in `tailwind.config.mjs`
- Base styles (body background, font defaults) are in `src/styles/global.css`
- The design uses a warm, earthy palette anchored by olive green

### Adding images
- Place images in `public/images/`
- Reference as `/images/filename.jpg` in templates
- Use `loading="lazy"` on all images below the fold
- For portfolio items, add entries to the `projects` array in `src/pages/portfolio.astro`

### Updating content
- All page content is inline in the `.astro` files (no CMS, no data files)
- Team bios, services, and process steps are defined as arrays in the frontmatter of their respective pages
- Contact info (email, phones, hours) appears in both `src/pages/contact.astro` and `src/components/Footer.astro` — update both

## Design Conventions

- **Headings**: Always use `font-serif` (Cormorant Garamond), typically `font-light`
- **Body text**: Uses `font-sans` (Inter) by default via global.css
- **Buttons/CTAs**: Bordered style with `text-xs uppercase tracking-[0.15em]` or `tracking-[0.2em]`
- **Section backgrounds**: Alternate between `bg-cream` (default), `bg-cream-dark`, and `bg-olive` (for CTAs)
- **Photo treatment**: `object-cover` with `overflow-hidden` containers, subtle `hover:scale-105` on interactive items
- **Page headers**: `pt-28 md:pt-36` to clear the sticky nav

## Brand Assets

- `public/images/logo-white.png` — white logo (for dark/olive backgrounds) — used in header and footer
- `public/images/logo-green.png` — green logo (for light backgrounds) — available but not currently used

## Deployment (Cloudflare Pages)

Hosted on Cloudflare Pages as project `revive-web`.

| Environment | URL | Command | Branch |
|-------------|-----|---------|--------|
| Dev | `dev.revive-web.pages.dev` | `npm run deploy:dev` | `dev` |
| Staging | `staging.revive-web.pages.dev` | `npm run deploy:staging` | `staging` |
| Production | `revive-web.pages.dev` / `revivestudiosut.com` | `npm run deploy:production` | `main` |

**Workflow**: dev → staging → production. Validate at each stage before promoting.

Production custom domain (`revivestudiosut.com`) is configured via Cloudflare Pages custom domains once DNS is pointed to Cloudflare.

## Environment Variables & Secrets

Environment variables are managed with **direnv** and `.env.*` files.

| File | Contains secrets? | Checked in? | Purpose |
|------|-------------------|-------------|---------|
| `.env` | No | Yes | Shared defaults (placeholder Turnstile key, destination email) |
| `.env.example` | No | Yes | Documents all required variables |
| `.env.dev` | Yes | No | Dev environment keys |
| `.env.staging` | Yes | No | Staging environment keys |
| `.env.production` | Yes | No | Production environment keys |
| `.dev.vars` | Yes | No | Wrangler local dev secrets for Pages Functions |
| `.envrc` | No | Yes | direnv auto-loader |

**Build-time vars** (`PUBLIC_TURNSTILE_SITE_KEY`): Loaded by Astro from the environment via direnv. The `DEPLOY_ENV` variable in the deploy scripts selects the right `.env.*` file.

**Runtime secrets** (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`): Set in the Cloudflare dashboard under Workers & Pages → revive-web → Settings → Environment variables. Use separate values for Production and Preview environments.

### Adding a new secret
1. Add to `.env.example` to document it
2. Add to each `.env.dev`, `.env.staging`, `.env.production` with real values
3. If needed by the Pages Function at runtime, also set it in the Cloudflare dashboard
4. If needed at build time, prefix with `PUBLIC_` and reference as `import.meta.env.PUBLIC_VAR_NAME` in `.astro` files

## Contact Form Architecture

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
