# Agents Guide — Revive Studios Website

## Project Overview

Static marketing website for Revive Studios, an interior design company in Alpine, UT. Built with Astro 5 + Tailwind CSS 3. No backend, no database, no authentication.

## Tech Stack

| Layer | Technology | Config File |
|-------|-----------|-------------|
| Framework | Astro 5 | `astro.config.mjs` |
| Styling | Tailwind CSS 3 | `tailwind.config.mjs` |
| Fonts | Google Fonts (Cormorant Garamond + Inter) | Loaded in `src/layouts/BaseLayout.astro` |
| Images | Static files in `public/images/` | Referenced by path in templates |

## Commands

```bash
npm run dev      # Start dev server on port 4321
npm run build    # Build static site to dist/
npm run preview  # Preview production build
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

- `design-assets/Revive_White.png` — white logo (for dark/olive backgrounds)
- `design-assets/Revive_Green.png` — green logo (for light backgrounds)
- `public/images/logo-white.png` — copy of white logo used by the site

## Deployment

Static site — deploy the `dist/` output to any static host (Netlify, Vercel, Cloudflare Pages). No server-side rendering needed.

Before deploying: replace the placeholder Formspree URL in `src/pages/contact.astro` with a real form endpoint.
