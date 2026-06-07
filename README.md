# Revive Studios Website

This is the website for [Revive Studios](https://revivestudiosut.com), an interior design company in Alpine, UT.

It is built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com) and hosted on [Cloudflare Pages](https://pages.cloudflare.com). You do not need to know what any of that means to make everyday changes. Most edits are done by asking Claude in plain English.

## Making changes (the easy way)

You manage this site by talking to Claude. Describe what you want in normal language and Claude does the technical work: editing the files, optimizing photos, previewing the result, and publishing.

Things you can ask for:

- **Add a portfolio project**: "Add a new project for the Smith kitchen in Draper" and Claude will ask for the photos and details.
- **Add a journal post**: "Write a journal post about choosing countertops."
- **Change wording**: "Update the services page so the fee range reads 3 to 5 percent."
- **Swap a photo**: "Replace the about-page photo of Cassidy with this new one."
- **Publish**: "Preview my changes, then publish to the live site."

For adding projects and journal posts there is a built-in guided helper: Claude asks you simple questions (title, location, photos, a short description) and handles all the formatting for you, so you never have to touch a file. Just say something like "add a new project."

Claude follows the project guide in [`CLAUDE.md`](./CLAUDE.md), which has the full technical details if you ever want them.

## Previewing your changes

Before anything goes live, you can see it on your own computer.

- Ask Claude to **start a preview** (it runs `just dev`), then open http://localhost:4321 in your browser.
- The preview updates automatically as changes are made.

## Publishing the site

There are three versions of the site, and you move changes through them in order so nothing breaks the live site:

1. **Dev** (`dev.revive-web.pages.dev`): a private sandbox for trying things out.
2. **Staging** (`staging.revive-web.pages.dev`): a final review copy.
3. **Production** (`revivestudiosut.com`): the real, public website.

The normal flow is dev, then staging, then production. Ask Claude to publish and it runs the right command for each step:

| Step | What to ask Claude | Behind the scenes |
|------|--------------------|-------------------|
| Try it out | "Publish to dev" | `just deploy-dev` |
| Review copy | "Publish to staging" | `just deploy-staging` |
| Go live | "Publish to production" | `just deploy-production` |

**Always test on dev or staging first, then go live.** Publishing to production also records a new version number for the site, so only do it when you actually have changes to release.

> Note for whoever runs the commands directly: build and deployment go through the `justfile` recipes, never raw `npm` or `wrangler`. Run `just` to see all available recipes.

## Where things live

```
src/
├── content/
│   ├── projects/   # Each portfolio project is one file here
│   └── journal/    # Each journal post is one file here
├── pages/          # The main pages: home, about, services, process, contact, portfolio
├── components/     # Shared pieces: the header, footer, cards
└── styles/         # Colors and fonts

public/images/      # All photos and logos
functions/api/      # The code that powers the contact form
```

You usually will not need to open these yourself. Claude knows where everything is.

## First-time setup (technical)

This part is only needed once, by the person setting up the project on a new computer.

**Prerequisites**

- Node.js >= 22.12.0
- [direnv](https://direnv.net/) for environment management (`brew install direnv`)
- Cloudflare account access with a Pages API token (see [`CLAUDE.md`](./CLAUDE.md) for the auth details)

**Setup**

```bash
just install                 # Install dependencies
cp .env.example .env.dev     # Then fill in your keys
direnv allow                 # Auto-loads environment variables
just dev                     # Start the local preview at http://localhost:4321
```

**Environment variables**

Secrets are managed with direnv and `.env.*` files. See `.env.example` for the full list.

| Variable | Where used | Secret? |
|----------|-----------|---------|
| `PUBLIC_TURNSTILE_SITE_KEY` | Build time (Astro) | No |
| `TURNSTILE_SECRET_KEY` | Runtime (contact form) | Yes |
| `RESEND_API_KEY` | Runtime (contact form) | Yes |
| `CONTACT_TO_EMAIL` | Runtime (contact form) | No |

Runtime secrets are set in the Cloudflare dashboard under Workers & Pages, then revive-web, then Settings, then Environment variables. Full details are in [`CLAUDE.md`](./CLAUDE.md).
