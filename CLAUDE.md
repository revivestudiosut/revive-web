# Revive Studios Website

Marketing website for Revive Studios, an interior design company in Alpine, UT. Built with Astro 5 + Tailwind CSS 3, hosted on Cloudflare Pages with a Pages Function for the contact form. The business is run by Megan Davies and Cassidy Johnson.

> This is the canonical project guide. `AGENTS.md` points here; keep all project documentation in this file.

## Build & Deploy: always use the justfile

**Build and deployment steps go through the `justfile` recipes, never raw `npm` or `wrangler`.** Run `just` to list recipes. The recipes wrap the underlying tools and (for production) also cut a release, so calling the tools directly skips important steps.

```bash
just doctor             # Check your machine is set up correctly (run this first)
just install            # Install dependencies (includes wrangler)
just dev                # Local dev server on http://localhost:4321
just build              # Build static site to dist/
just preview            # Build, then preview the production build locally
just serve              # Build, then run wrangler pages dev (local Pages Functions: Turnstile + Resend)
just deploy-dev         # Build + deploy to dev      (dev.revive-web.pages.dev)
just deploy-staging     # Build + deploy to staging  (staging.revive-web.pages.dev)
just deploy-production  # Emergency fallback: direct build + deploy to production (no bump/tag). Releases go through GitHub Actions.
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

**CI (GitHub Actions) is the primary deploy path.** The pipeline is trunk-based: `main` is the trunk, and deploys originate from it, not from long-lived per-tier branches. Changes reach `main` only through approved pull requests (see *Branch protection* below). There is one Cloudflare Pages project, `revive-web`; the deployment tiers (`dev`, `staging`, `main`) are Cloudflare deploy *aliases* selected with `--branch`, not git branches you maintain. The `just deploy-*` recipes remain as a manual/emergency fallback (see below).

### The pipeline

| Trigger | Workflow | Result |
|---|---|---|
| PR opened/updated (org member) | `.github/workflows/preview-dev.yml` | Build + deploy the PR to **dev** for review (shared `dev` alias; trusted same-repo authors only, fork PRs skipped). |
| PR into `main` | `.github/workflows/ci.yml` | `npm ci` + build. No deploy. The required `build` check. |
| PR approved | `.github/workflows/automerge.yml` | Arm squash auto-merge; GitHub merges once `build` passes, then deletes the head branch. |
| Push/merge to `main` | `.github/workflows/deploy.yml` | Build + deploy to **staging** (the integration tier / release candidate). |
| Manual (Actions tab), **gated** | `.github/workflows/release.yml` | Waits for a **production owner** to approve, then bumps `package.json`, commits `release vX.Y.Z`, and pushes the tag. |
| Push a `vX.Y.Z` tag | `.github/workflows/deploy-production.yml` | Rebuild the tagged commit, deploy to **production**. |

**Flow** (three-tier ladder): an org member opens a PR -> it deploys to **dev** for review -> it gets **1 approval** -> `automerge.yml` squash-merges to `main` -> `main` deploys to **staging** -> to ship, run the **Release** workflow, which waits for a **production owner** to approve, then tags `main` and the tag deploys to **production**.

The three tiers and what each means:
- **dev** — `dev.revive-web.pages.dev` — the open PR under review (pre-merge). Shared alias, so concurrent PRs overwrite each other here (accepted; low velocity).
- **staging** — `staging.revive-web.pages.dev` — the merged trunk / release candidate.
- **production** — `revivestudiosut.com` (+ `www`) — the released site.

### Branch protection & the PR workflow

The repo is **public** (`revivestudiosut/revive-web`), which is what makes GitHub's free branch *rulesets* available. An active ruleset on `main` enforces the team workflow:

- **Every change goes through a PR** — direct pushes and force-pushes to `main` are blocked.
- A PR needs **1 approving review** and a green **`build`** check (`ci.yml`) before it can merge.
- On approval, `automerge.yml` **squash-merges** automatically and the head branch is **deleted** (`delete_branch_on_merge`); squash is the only enabled merge method.
- **Org/repo admins bypass** the ruleset, by design: `release.yml` pushes the `release vX.Y.Z` commit + tag straight to `main`, which works only because `RELEASE_PAT` acts as an admin. Admins can therefore also push to `main` directly (e.g. the `just` fallback); team members cannot.

**Approving a PR vs. releasing to production are separate capabilities:**
- **Approve a PR** = any collaborator with **Write** access (their review satisfies the ruleset's required approval). `johnsbom000` has this.
- **Release to production** = a **required reviewer on the `production` GitHub Environment** ("production owner"). `release.yml` runs in that environment, so it pauses until an owner approves, then tags + deploys. Owners today: **`trentdavies`, `johnsbom000`**. Admin bypass is enabled, so admins can release without waiting. A Write collaborator who is *not* a production owner can open/approve PRs and even start a release, but cannot pass the production gate.

**Why a PAT (not `GITHUB_TOKEN`).** GitHub will not start a workflow from a ref pushed with the default `GITHUB_TOKEN` (recursion prevention). So `release.yml` pushes its commit + tag using `RELEASE_PAT`; otherwise the tag would never trigger `deploy-production.yml`. The same reason applies to `automerge.yml`: it enables auto-merge with `RELEASE_PAT` so the resulting squash-merge to `main` re-triggers `deploy.yml` (staging). Pushing a tag by hand from a laptop (`git push origin vX.Y.Z`) also triggers production normally.

### Required GitHub repo configuration

Set these once in **Settings -> Secrets and variables -> Actions** on `revivestudiosut/revive-web`:

| Name | Kind | Value / scope |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Secret | A dedicated CI *Cloudflare Pages: Edit* token (revocable independently of personal tokens). |
| `CLOUDFLARE_ACCOUNT_ID` | Variable | `dd7ff2e714fde32812bdc06d12a5a407` (not secret). |
| `RELEASE_PAT` | Secret | Fine-grained PAT, this repo, **Contents: Read and write** + **Pull requests: Read and write**. Contents lets `release.yml` push the commit/tag (so the tag triggers prod); Pull requests lets `automerge.yml` enable auto-merge. (A GitHub App token via `actions/create-github-app-token` is an equivalent.) |

Runtime secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_TO_EMAIL`, `EMAIL_FROM`) are **not** GitHub secrets; Cloudflare injects them at request time from its own dashboard config. The build-time `PUBLIC_TURNSTILE_SITE_KEY` is read from the committed `.env` by Astro at build time, so CI needs no build secret.

### Manual fallback (`just deploy-*`)

For laptop deploys when Actions is unavailable. Each recipe builds, then deploys `dist/`. `wrangler` needs `CLOUDFLARE_API_TOKEN` (a *Cloudflare Pages: Edit* token, secret, in `.env.local`) and `CLOUDFLARE_ACCOUNT_ID` (not secret, in the committed `.env`). Every deploy/serve/logs recipe runs a `_preflight-auth` check first: it verifies the token via Cloudflare's `/user/tokens/verify` endpoint and fails fast with setup steps if missing or rejected. Note: `wrangler whoami` reports "incorrect permissions" with a Pages-scoped token; that is expected (we use `/tokens/verify` instead), and deploys still work because the account ID is supplied directly.

- `just deploy-dev` / `just deploy-staging` — build + deploy to that alias.
- `just deploy-production` — **emergency direct publish only**: builds and deploys current content to the `main` alias with **no version bump and no tag**. Releases (bump + tag) belong to the Release workflow. Guarded by a typed `yes` confirmation.

**One token covers all tiers; tokens cannot gate production.** There is one Pages project and the tiers are just aliases, so a single account-scoped token deploys dev, staging, and production. Cloudflare's *Pages: Edit* permission is account-level with no per-branch scoping, so a token that can deploy dev/staging can also deploy production. Per-tier Cloudflare tokens are unnecessary, so `.env.staging`/`.env.production` do not exist.

**Onboarding editors.** Required local tools for the manual fallback: `just`, Node >= 22.12.0 (see `.nvmrc`), `direnv` (installed, shell-hooked, and `direnv allow`-ed), and `git`. `just doctor` (or `bash scripts/doctor.sh`, runnable before anything is set up) checks all of these plus that `.env.local` has a token. Issue each editor their **own** Pages: Edit token (revoke/audit per person) from `dash.cloudflare.com -> My Profile -> API Tokens`.

## Environment Management

Uses **direnv** to auto-load environment variables.

| File | Secrets? | Checked in? | Purpose |
|------|----------|-------------|---------|
| `.env` | No | Yes | Shared defaults (Turnstile site key, destination email, `CLOUDFLARE_ACCOUNT_ID`) |
| `.env.local` | Yes | No | **Your personal `CLOUDFLARE_API_TOKEN`** (and any machine-local secrets). Always loaded, tier-agnostic. |
| `.env.example` | No | Yes | Documents every variable and where it belongs |
| `.dev.vars` | Yes | No | Wrangler local dev secrets for Pages Functions (`just serve`) |
| `.env.dev` | Yes | No | Optional local app-secret overrides (no longer holds Cloudflare auth) |
| `.envrc` | No | Yes | direnv loader: loads `.env`, then `.env.local`, then an optional `.env.${DEPLOY_ENV}` |

**Required variables**: `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`.

**Build-time vars** (`PUBLIC_`-prefixed, e.g. `PUBLIC_TURNSTILE_SITE_KEY`): exposed to client-side code by Astro at build time, loaded from the environment via direnv. Reference as `import.meta.env.PUBLIC_VAR_NAME` in `.astro` files.

**Runtime secrets** (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`): set in the Cloudflare dashboard under Workers & Pages -> revive-web -> Settings -> Environment variables. Use separate values for the Production and Preview environments.

### Adding a new secret
1. Add it to `.env.example` to document it.
2. Add it to `.env.local` with the real value.
3. If the Pages Function needs it at runtime, also set it in the Cloudflare dashboard.
4. If it is needed at build time, prefix with `PUBLIC_` and reference as `import.meta.env.PUBLIC_VAR_NAME`.
