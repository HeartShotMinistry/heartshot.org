# heartshot.org

Heart Shot Ministry's website — a static [Astro](https://astro.build) site, built to replace the old WordPress/GoDaddy setup with free hosting and DNS both on Cloudflare (Workers with static assets). Source lives at [github.com/dhoepp/heartshot](https://github.com/dhoepp/heartshot); Cloudflare deploys automatically on push, currently live at `heartshot.dustin-hoeppner.workers.dev` pending the custom-domain cutover.

## Editing content (no coding required)

Most of what you'd want to change lives in plain files, editable right in GitHub's web UI (open the file, click the pencil icon, edit, commit):

- **Page text** — `src/content/pages/*.md`. One file per page (home, about, forms, donate, subscribe, contact). Edit the text between the `---` frontmatter and the content; it's plain Markdown (blank line between paragraphs, `##` for a heading, `[link text](https://example.com)` for a link).
- **Phone, address, hours, social links, donation links** — `src/data/site.ts`. This one file feeds the header, footer, and donate page, so a change here updates everywhere at once.
- **Seasonal events** (Golf Outing, Trivia Night, Archery Camp, New Year's) — `src/content/events/*.md`. Each has `published: false` in its frontmatter. When it's time to run that event again:
  1. Update the dates, pricing, and any registration/PayPal links in the file.
  2. Change `published: false` to `published: true`.
  3. Commit. The page goes live at `/events/<file-name>/` and an "Events" link automatically appears in the nav.
  4. When the event's over, flip it back to `false` — the page disappears from the site (not just the menu) until next time.

Any change committed to `main` redeploys the live site automatically within a couple of minutes (see Deployment below).

## Before this goes live

- **Contact form** (`src/pages/contact.astro`) — still posts to a placeholder Formspree endpoint. Create a free form at [formspree.io](https://formspree.io) and paste the real endpoint into `forms.contactEndpoint` in `src/data/site.ts`. It's a plain HTML `<form>` pointed at a config URL, so swapping it for a Worker route later (matching how Subscribe works now) is a small, contained change — not a template rewrite.

- **Subscribe form** (`src/pages/subscribe.astro` → `POST /api/subscribe` → `worker/index.js`) — this one's actually wired up, not a placeholder. It calls the Mailchimp API server-side with the real audience (`MAILCHIMP_LIST_ID` in `wrangler.jsonc`, confirmed against this list's actual merge fields — `ADDRESS` is a compound field, not flat `ADDR1`/`CITY`/etc., which is why the Worker assembles them into a nested object before calling Mailchimp). **One thing still needed for it to work in production:** the `MAILCHIMP_API_KEY` secret has to be set on the Cloudflare Worker project itself — a `.dev.vars` file locally (already set up, gitignored) only covers `wrangler dev`, it doesn't carry over to the deployed Worker. Set it with:

  ```sh
  npx wrangler secret put MAILCHIMP_API_KEY
  ```

  (or via the Cloudflare dashboard: your Worker project → **Settings → Variables and Secrets**). Paste the same key that's in your local `.env`/`.dev.vars`.

  Once that's set, test it for real with a throwaway/your-own email — a live submission does write a real contact into the Mailchimp audience (and will trigger any welcome-email automation on that list), so it's worth doing deliberately rather than as an afterthought:

  ```sh
  curl -i -X POST https://heartshot.dustin-hoeppner.workers.dev/api/subscribe \
    -d "EMAIL=you@example.com" -d "FNAME=Test" -d "LNAME=Subscriber" \
    -d "ADDR1=123 Main St" -d "CITY=Davenport" -d "STATE=IA" -d "ZIP=52806"
  ```

  A successful signup redirects (303) to `/thank-you/`. Check the contact landed correctly in Mailchimp, then delete it if it was just a test.

## Local development

```sh
npm install
npm run dev
```

Visit `http://localhost:4321`. Changes hot-reload.

```sh
npm run build      # production build to ./dist
npm run preview    # serve the production build locally (static only, no /api/subscribe)
npm run worker:dev # build + run the full Worker locally, including /api/subscribe — reads secrets from .dev.vars
```

The `/api/subscribe` route (see `worker/index.js`) needs the actual Cloudflare Worker runtime — `npm run preview` (plain Astro) won't serve it. Use `npm run worker:dev` to exercise the real request path locally.

## Deployment

Hosted on **Cloudflare Workers** with static assets — connected directly to the GitHub repo, currently deploying to `heartshot.dustin-hoeppner.workers.dev` on every push to `main`; other branches/PRs get automatic preview URLs. No GitHub Actions workflow needed — Cloudflare builds and deploys on its own.

`wrangler.jsonc` defines the build: `main: worker/index.js` handles `/api/subscribe`, `assets.directory: ./dist` serves everything else (the Astro build output). Since this project was originally connected as a plain static site (before `wrangler.jsonc` and the worker existed), **double check the project's build/deploy configuration in the Cloudflare dashboard** picked up the change correctly after this was added — Settings → Build should be running `npm run build` and letting Wrangler handle the deploy from `wrangler.jsonc`, not just uploading `dist/` as flat static files.

Don't forget the `MAILCHIMP_API_KEY` secret (see "Before this goes live" above) — without it, `/api/subscribe` will 500 in production even though everything else works.

## Custom domain (Cloudflare DNS + Cloudflare Workers)

Since hosting and DNS both live in Cloudflare, this is simpler than a cross-vendor setup:

1. Move heartshot.org's nameservers to Cloudflare.
2. **Before or during that switch, copy every existing MX and TXT record** from the current DNS host — heartshot.org has live email (e.g. troy@heartshot.org) and losing those records will break it.
3. In the Worker project's **Settings → Domains & Routes** (or **Triggers**, naming varies), add `heartshot.org` (and `www` if wanted) — Cloudflare adds the necessary DNS records itself since it already manages the zone.
4. Confirm the site loads over HTTPS and send a test email to the domain to confirm mail still works.

## What's not migrated yet

- **Media library** — only images/PDFs actually used by a page were pulled over from the old WordPress media library (191 items existed there; most were auto-generated thumbnail sizes not needed here).
- **Instagram feed** — the homepage previously embedded a live Instagram feed via a WordPress plugin. For now the footer just links out to Instagram; a static-friendly embed widget (e.g. SnapWidget) can be added later if a live feed is wanted.
- **Gallery / News pages** — these existed on the old site but had no content, so they weren't carried over.

## `/thank-you/` — don't delete this one

`src/pages/thank-you.astro` isn't linked from the nav, but it's not dead weight: it's the payment-return landing page several PayPal hosted buttons (Donate-adjacent, raffle/shop, event sponsorships) are configured — on PayPal's side, not visible in this repo — to redirect to after checkout. Since the domain isn't changing, that redirect keeps working automatically as long as this route stays live at the same path. If it's ever removed, check the return URL on each PayPal hosted button first.
