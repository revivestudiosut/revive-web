---
name: add-portfolio-entry
description: "Add a new portfolio project or journal post to the Revive Studios website. Use when an employee says things like 'add a new project', 'add a portfolio entry', 'document a job', 'add a journal post', 'write a journal entry', 'write a blog post', 'publish a post about X', 'new content for the website', or 'add a case study'. Guides the user step-by-step through gathering title, location, description, images, and optional project linkage, then creates a correctly-formatted markdown file under src/content/ and runs a preview."
---

# Add a Portfolio Project or Journal Post

This skill helps a Revive Studios employee add a new **project** (a completed job in the portfolio) or a new **journal post** (a story, technique article, or note — optionally tied to a project) to the website.

The employee may not know markdown, frontmatter, or the file layout. **Do all the technical steps for them.** Ask plain-language questions, then create the file.

## When to use

Trigger phrases (examples):
- "Add a new portfolio project"
- "I want to add the Smith kitchen we just finished"
- "Add a journal post about our brass selection process"
- "Write a blog post on choosing tile"
- "Document the basement we just finished"
- "Add a case study for the Henderson home"
- "Publish a journal entry"

If the request is ambiguous (e.g. "add new content"), ask: **"Are we adding a portfolio project (a completed job) or a journal post (an article)?"**

## Step 1 — Decide what's being added

There are two content types:

| Type | What it is | Where it lives |
|---|---|---|
| **Project** | A completed job, with photos and a short description, shown on the portfolio grid | `src/content/projects/<slug>.md` |
| **Journal post** | A longer-form article — can be tied to a project ("Behind the X kitchen") or stand alone ("Choosing paint for north-facing rooms") | `src/content/journal/<slug>.md` |

## Step 2 — Project flow

Ask the employee these questions one at a time (or all at once if they prefer). Collect plain-language answers — don't make them fill out frontmatter.

1. **Project name** — what should we call it? (e.g. "Luxe Kitchen", "Henderson Bathroom")
2. **Location** — city and state (e.g. "Alpine, UT")
3. **Short description** — 1–3 sentences for the portfolio card and project page intro
4. **Hero image** — the main photo for the project (filename or path)
5. **Gallery images** — additional photos to show on the project page (list of filenames; can be empty if it's just the hero)
6. **Completion date** — when was the project finished? Use today's date if it just wrapped. Set `completedAt` in `YYYY-MM-DD` format. **This drives the "Recent Projects" section on `/portfolio`** — projects without a date sink to the bottom, so always set this for new work.
7. **Featured?** — should this project be the big featured banner at the top of `/portfolio`? Default: **no** (only one project should be featured at a time; if they say yes, ask if you should un-feature the current featured project)

### Image handling

- All images go in `public/images/`. Check whether the files the employee mentioned already exist there with `ls public/images/`.
- If they don't exist, ask the employee to provide them. They can drop the files into `public/images/` directly, or paste file paths and you can copy them in.
- Use lowercase, hyphenated filenames (e.g. `henderson-bathroom.jpg`, not `Henderson Bathroom.JPG`).
- In frontmatter, reference images as `/images/<filename>` (the leading slash is important).

### Generating the slug

The slug is the URL piece (`/portfolio/<slug>`). Derive it from the project name:
- Lowercase
- Replace spaces with hyphens
- Strip punctuation
- Examples: "Luxe Kitchen" → `luxe-kitchen`, "Henderson Bathroom" → `henderson-bathroom`

Check there's no existing file with the same slug in `src/content/projects/` before creating.

### Featured handling

If the employee wants this project featured, find the currently-featured project (`grep -l "featured: true" src/content/projects/`), and ask whether to flip its `featured` flag to `false`. Only one project should be featured at a time.

### Project file template

Write the file at `src/content/projects/<slug>.md`:

```markdown
---
title: <Project Name>
location: <City, ST>
description: <1–3 sentence description>
hero: /images/<hero-filename>
gallery:
  - /images/<hero-filename>
  - /images/<gallery-1-filename>
completedAt: <YYYY-MM-DD>
featured: false
---

<Optional longer narrative — case study, materials story, design notes.
Renders below the description on the project detail page. Use ## for
section headings; supports the same markdown as journal posts.>
```

The body (everything below the closing `---`) is rendered on the project detail page, styled with the same `.prose-journal` classes used for journal posts. It's optional but a great place for a 2–3 paragraph design story.

Notes on the schema (see `src/content.config.ts`):
- `title`, `location`, `description`, `hero` are **required**
- `gallery` defaults to empty; include the hero in the gallery list so it appears on the detail page
- `featured` defaults to `false` — only one project should be featured at a time
- `completedAt` is optional but **strongly recommended** — drives the "Recent Projects" section on `/portfolio`

## Step 3 — Journal post flow

Ask the employee:

1. **Title** — headline for the post (e.g. "Why we chose brass for the Luxe Kitchen")
2. **Short description** — one sentence, shown on the card and as the meta description
3. **Is this about a specific project?** — if yes, which one? (offer the list of project titles from `src/content/projects/`)
4. **Hero image** — optional; the main photo for the post
5. **Tags** — optional; topical keywords (e.g. `materials`, `paint`, `color`, `techniques`, `kitchens`)
6. **The actual content** — ask the employee for the post body. They can:
   - Paste text they've already written
   - Speak in bullet points and you draft a prose version for their review
   - Provide an outline and you flesh it out

### Project linkage

If the post is tied to a project, find the project's slug from `src/content/projects/`. Use that exact slug in the `project:` frontmatter field. Astro validates this at build time — if the slug is wrong, the build will fail with a clear error.

### Generating the slug

Same rules as projects: lowercase, hyphenated, no punctuation. Make it descriptive — this becomes the URL.

### Journal post template

Write the file at `src/content/journal/<slug>.md`:

```markdown
---
title: <Title>
description: <One sentence>
hero: /images/<filename>           # optional, omit the line if no hero
publishedAt: <YYYY-MM-DD>          # today's date by default
project: <project-slug>            # optional, omit the line if standalone
tags:
  - <tag-1>
  - <tag-2>
---

<Body content in markdown. Use ## for section headings, **bold**, _italic_,
bullet lists, [links](url), etc.>
```

For the `publishedAt` date, use today's date in `YYYY-MM-DD` format unless the employee specifies otherwise.

### Tone guidance for the body

Match the existing journal voice — see `src/content/journal/brass-in-the-luxe-kitchen.md` and `src/content/journal/choosing-paint-for-north-facing-rooms.md` for tone reference. Key qualities:

- Conversational but not casual — like a designer talking to a thoughtful homeowner
- Specific over generic — name the brass finish, the paint undertone, the actual project
- 400–800 words is a comfortable range
- Use `## Subheadings` to break up the post
- Avoid jargon; if you use a designer term, explain it
- End with a takeaway or invitation, not a hard sell

## Step 4 — Preview

After writing the file, run a preview so the employee can see their work:

```bash
npm run dev
```

Then tell them the URL to open:
- Project: `http://localhost:4321/portfolio/<slug>`
- Journal post: `http://localhost:4321/portfolio/journal/<slug>`

If they don't have the dev server running, start it for them. If `npm install` hasn't been run in this clone, run that first.

## Step 5 — Build check

Before considering the job done, run:

```bash
npm run build
```

This validates the frontmatter against the content schema. Common errors:
- **Missing required field** (e.g. forgot `location` on a project) — the error message names the field; fix and re-run.
- **Invalid project reference** (journal post links to a non-existent project slug) — check the slug spelling against `ls src/content/projects/`.
- **Invalid date format** — use `YYYY-MM-DD` for `publishedAt` and `completedAt`.

## Step 6 — Commit

Once the preview looks good and the build passes, offer to commit. Stage only:
- The new markdown file
- Any new image files added to `public/images/`

Do **not** stage `.png`/`.jpg` files outside `public/images/` (screenshots, exports). Do not stage the `dist/` directory. Use a commit message like:

- `add Luxe Kitchen to portfolio`
- `add journal post on brass selection`

Ask Trent (or whoever the user is) before pushing. Never push without confirmation.

## Reference — file structure

```
src/
├── content.config.ts                # schema definitions (don't edit unless adding new fields)
├── content/
│   ├── projects/                    # one .md per portfolio project
│   │   ├── luxe-kitchen.md
│   │   └── ...
│   └── journal/                     # one .md per journal post (.md or .mdx)
│       ├── brass-in-the-luxe-kitchen.md
│       └── ...
└── pages/
    └── portfolio/
        ├── index.astro              # /portfolio — reads from both collections
        ├── [slug].astro             # /portfolio/<project-slug>
        └── journal/
            ├── index.astro          # /portfolio/journal
            └── [slug].astro         # /portfolio/journal/<post-slug>

public/
└── images/                          # all hero and gallery images go here
```

## Reference — content schema (current)

From `src/content.config.ts`:

**Project**:
- `title: string` (required)
- `location: string` (required)
- `description: string` (required)
- `hero: string` (required, e.g. `/images/foo.jpg`)
- `gallery: string[]` (defaults to `[]`)
- `featured: boolean` (defaults to `false`)
- `completedAt: date` (optional, `YYYY-MM-DD`)

**Journal post**:
- `title: string` (required)
- `description: string` (required)
- `hero: string` (optional)
- `publishedAt: date` (required, `YYYY-MM-DD`)
- `project: reference('projects')` (optional — slug of a project)
- `tags: string[]` (defaults to `[]`)

If the employee wants a field that doesn't exist yet (e.g. `client` on a project, or `readingTime` on a post), ask Trent before adding it to the schema — schema changes affect the whole site.
