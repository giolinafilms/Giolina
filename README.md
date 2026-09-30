# GioLina Films website

Astro website migration preview using Cloudflare Workers and static assets.

## Local development
Use Node 24 or later. Run `npm ci`, then `npm run dev`.
Build with `npm run build`; validate with `npm run check`.

## Preview deployment
Connect this repository to Cloudflare Workers Builds. Build command: `npm run build`. Deploy command: `npx wrangler deploy`. The separate preview Worker name is `giolina-films-preview`, matching `wrangler.jsonc`. No GitHub Actions are required. No production domains are configured.

The preview blocks search indexing. Contact forms are disabled until delivery is implemented and verified. Analytics and domain-bound integrations need separate verification before launch. The preview is not ready for production cutover.

## Content and assets
Current page content is in `src/content/pages/`. Styling and real media are stored under `public/`. The first conversion preserves the existing layout through local compatibility CSS; final components and the editing workflow will follow visual review. No WordPress or Elementor JavaScript runtime is used.

Production deployment requires approved domain settings, functional and visual QA, SEO verification, a tested backup and rollback plan, and explicit cutover approval.

The optional About Us promotional video is deferred; its space is blank in this preview. Existing Vimeo wedding-film embeds are retained.

Before committing new JPG/PNG photos, ensure they are upright and run `npm run media:sanitize` to remove hidden personal metadata while retaining compressed pixels and color profiles.

The preview uses local font fallbacks for Avenir Next and the custom script font until their web redistribution licenses are verified. This is a visual QA gate before production. Font and icon license notices are under `licenses/`.
