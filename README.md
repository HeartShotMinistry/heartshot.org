# heartshot.org

Heart Shot Ministry's website — a static [Astro](https://astro.build) site, built to replace the old WordPress/GoDaddy setup with free hosting on GitHub Pages and DNS on Cloudflare.

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

Two pieces still point at placeholder values and need real accounts:

- **Contact form** (`src/pages/contact.astro`) — posts to a placeholder Formspree endpoint. Create a free form at [formspree.io](https://formspree.io) and paste the real endpoint into `forms.contactEndpoint` in `src/data/site.ts`.
- **Subscribe form** (`src/pages/subscribe.astro`) — posts to a placeholder Mailchimp URL. In Mailchimp, go to **Audience → Signup forms → Embedded forms**, copy the generated `<form action="...">` URL, and paste it into `forms.mailchimpAction` in `src/data/site.ts`. If Mailchimp's field names differ from what's in `subscribe.astro` (`EMAIL`, `FNAME`, `LNAME`, `ADDR1`, etc.), match them up so submissions map to the right fields.

The contact form is intentionally just a plain HTML `<form>` pointed at a config URL — swapping Formspree for a Cloudflare Worker later (per the plan) is a one-line change in `site.ts`, no template rewrite.

## Local development

```sh
npm install
npm run dev
```

Visit `http://localhost:4321`. Changes hot-reload.

```sh
npm run build      # production build to ./dist
npm run preview    # serve the production build locally
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. One-time setup in the GitHub repo: **Settings → Pages → Source: GitHub Actions**.

## Custom domain (Cloudflare + GitHub Pages)

The `public/CNAME` file (deployed as `dist/CNAME`) tells GitHub Pages this site serves `heartshot.org`. To point the live domain here:

1. Move heartshot.org's nameservers to Cloudflare.
2. **Before or during that switch, copy every existing MX and TXT record** from the current DNS host — heartshot.org has live email (e.g. troy@heartshot.org) and losing those records will break it.
3. In Cloudflare DNS, add the records GitHub Pages requires for a custom domain (A records to GitHub's IPs, plus a CNAME for `www`) — see [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
4. In the repo's **Settings → Pages**, set the custom domain to `heartshot.org` and enable "Enforce HTTPS."
5. Confirm the site loads over HTTPS and send a test email to the domain to confirm mail still works.

## What's not migrated yet

- **Media library** — only images/PDFs actually used by a page were pulled over from the old WordPress media library (191 items existed there; most were auto-generated thumbnail sizes not needed here).
- **Instagram feed** — the homepage previously embedded a live Instagram feed via a WordPress plugin. For now the footer just links out to Instagram; a static-friendly embed widget (e.g. SnapWidget) can be added later if a live feed is wanted.
- **Gallery / News pages** — these existed on the old site but had no content, so they weren't carried over.
