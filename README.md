# Revive Studios Website

Marketing website for [Revive Studios](https://revivestudiosut.com), an interior design company in Alpine, UT.

Built with [Astro 5](https://astro.build) + [Tailwind CSS 3](https://tailwindcss.com). Hosted on [Cloudflare Pages](https://pages.cloudflare.com).

## Prerequisites

- Node.js >= 22.12.0
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) for deployments (`npm install -g wrangler`)
- Cloudflare account access (authenticate with `wrangler login`)

## Getting Started

```bash
npm install
npm run dev
```

The site runs at http://localhost:4321.

## Build

```bash
npm run build    # Static output to dist/
npm run preview  # Preview the production build locally
```

## Deployment

Three environments, deployed via Cloudflare Pages branch aliases:

| Environment | Command | URL |
|-------------|---------|-----|
| Dev | `npm run deploy:dev` | https://dev.revive-web.pages.dev |
| Staging | `npm run deploy:staging` | https://staging.revive-web.pages.dev |
| Production | `npm run deploy:production` | https://revive-web.pages.dev |

**Workflow**: always deploy to dev or staging first. Validate the site, then promote to production.

```bash
# Deploy to dev to test changes
npm run deploy:dev

# Looks good — promote to staging
npm run deploy:staging

# Final validation — ship it
npm run deploy:production
```

Production will also be accessible at `revivestudiosut.com` once the custom domain is configured in Cloudflare Pages.

## Project Structure

```
src/
├── layouts/BaseLayout.astro    # HTML shell, fonts, meta tags
├── components/
│   ├── Header.astro            # Olive (#5f6961) sticky nav with white logo
│   └── Footer.astro            # Dark charcoal footer with contact info
├── pages/
│   ├── index.astro             # Homepage
│   ├── about.astro             # Team bios, company story, design process
│   ├── services.astro          # Service offerings with photos
│   ├── portfolio.astro         # Project photo grid
│   └── contact.astro           # Contact form + details
└── styles/global.css           # Tailwind directives + base styles

public/images/                  # All site photography and logos
tailwind.config.mjs             # Design tokens (colors, fonts)
astro.config.mjs                # Astro configuration
```
