# Revive Studios Website

Interior design company website built with Astro 5 + Tailwind CSS 3.

## Quick Start

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # Static output to dist/
```

## Architecture

- **Framework**: Astro 5 (static site, zero client JS except mobile menu)
- **Styling**: Tailwind CSS 3 with custom design tokens in `tailwind.config.mjs`
- **Pages**: `src/pages/` — index, about, services, portfolio, contact
- **Components**: `src/components/` — Header, Footer (shared via BaseLayout)
- **Layout**: `src/layouts/BaseLayout.astro` — wraps all pages with head, header, footer

## Design System

### Colors
- **Olive** `#5f6961` — primary brand color, top banner, buttons, CTAs
- **Cream** `#faf8f5` — page background
- **Cream Dark** `#f0eade` — alternate section backgrounds
- **Charcoal** `#2c2c2c` — body text
- **Charcoal Light** `#6b6b6b` — muted/secondary text
- **Warm Gray** `#e6e0d0` — borders, dividers

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
│   ├── index.astro             # Hero, purpose, services, CTA
│   ├── about.astro             # Story, team, process
│   ├── services.astro          # 4 services with photos
│   ├── portfolio.astro         # Photo grid with hover overlays
│   └── contact.astro           # Form + contact details
└── styles/global.css           # Tailwind directives + base styles
```

## Images

All images live in `public/images/`. Key files:
- `logo-white.png` — white logo for the olive header (copied from design-assets/)
- `hero-kitchen.jpg` — homepage hero background
- `megan-photo.jpg`, `cassidy-photo.jpg` — team portraits
- `portfolio-*.jpg`, `piano-room.png`, etc. — project photography

Original brand assets are in `design-assets/` (Revive_White.png, Revive_Green.png).

## Contact Form

The contact form currently points to a placeholder Formspree endpoint. Replace `https://formspree.io/f/placeholder` in `src/pages/contact.astro` with a real form handler before deploying.
