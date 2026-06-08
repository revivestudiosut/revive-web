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

**Always test on dev or staging first, then go live.** Publishing to production also records a new version number for the site, so only do it when you actually have changes to release. As a safety step, publishing to production asks you to type `yes` to confirm.

**The first time you publish from a new computer**, you need a one-time Cloudflare login set up (see [First-time setup](#first-time-setup-technical) below). If a publish ever says authentication is missing, run `just doctor` and it will tell you exactly what to fix.

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

**Prerequisites** (install these once, all available via `brew install`)

- [just](https://github.com/casey/just): runs the project commands (`brew install just`)
- Node.js >= 22.12.0: builds the site ([nodejs.org](https://nodejs.org))
- [direnv](https://direnv.net/): loads your settings automatically (`brew install direnv`). After installing, add this line to `~/.zshrc` and restart your terminal: `eval "$(direnv hook zsh)"`
- git: to download and update the project

**Setup**

```bash
just install                 # Install dependencies (includes wrangler)
cp .env.example .env.local   # Create your personal settings file
# Open .env.local and paste in your own Cloudflare API token (ask Trent for one):
#   CLOUDFLARE_API_TOKEN=your-token-here
direnv allow                 # Loads your settings
just doctor                  # Confirms everything is set up correctly
just dev                     # Start the local preview at http://localhost:4321
```

**Your Cloudflare token.** Each person gets their own token (so it can be turned off individually if a laptop is lost). Get one at [dash.cloudflare.com → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens), Create Token, permission "Cloudflare Pages: Edit", or just ask Trent. It goes in `.env.local` only; never commit it.

**If a deploy says authentication is missing:** run `just doctor`. It checks each prerequisite and your token and prints exactly what to fix (most often: add the token to `.env.local`, then run `direnv allow`).

**Environment variables.** `.env.example` documents every variable and where it belongs. You only create `.env.local` (your token); the site's contact-form secrets live in the Cloudflare dashboard and aren't needed to deploy. Full details are in [`CLAUDE.md`](./CLAUDE.md).
