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

There are three versions of the site, and changes move through them in order so nothing breaks the live site:

1. **Dev** — <https://dev.revive-web.pages.dev> — where your change appears first.
2. **Staging** — <https://staging.revive-web.pages.dev> — the review copy, kept in step with the latest approved changes.
3. **Production** — <https://revivestudiosut.com> — the real, public website.

### How a change goes live

Every change is reviewed before it can reach the live site. Once you ask Claude to publish, the steps are mostly automatic:

1. **Claude opens a pull request** (a "PR") with your change. Nothing is public yet.
2. **A teammate approves it.** They review the PR on GitHub and click Approve. (GitHub does not let you approve your own change, so this is always a second set of eyes.)
3. **It merges by itself.** As soon as it is approved and the automated build passes, the change is squashed into the main project and its temporary branch is cleaned up automatically.
4. **Dev and staging update on their own**, within a minute or two. **This is where you check your work before it reaches the public:**
   - Dev: <https://dev.revive-web.pages.dev>
   - Staging: <https://staging.revive-web.pages.dev>
5. **Go live with a release.** When dev and staging look right, publish to production by asking Claude to "cut a release" (or run the **Release** workflow in GitHub's _Actions_ tab). That records a new version number and updates <https://revivestudiosut.com> automatically.

So the everyday loop is: **ask for a change → a teammate approves it → check it on the dev and staging URLs → release to production when you're happy.** You do not need anything installed on your own computer for this; it all happens on GitHub and Cloudflare.

### If GitHub Actions is ever unavailable

There is a manual fallback that publishes straight from a set-up computer: `just deploy-dev`, `just deploy-staging`, and `just deploy-production` (an emergency direct publish, no version bump). It skips the review step, so use it only in an emergency, and it needs the one-time [First-time setup](#first-time-setup-technical) below. If a manual deploy ever says authentication is missing, run `just doctor`. Build and deployment otherwise go through the `justfile` recipes, never raw `npm` or `wrangler` — run `just` to see them.

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

This part is only needed once, by the person setting up the project on a new computer. It covers running the site locally and the emergency manual deploy — everyday publishing happens automatically on GitHub and needs none of this.

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
