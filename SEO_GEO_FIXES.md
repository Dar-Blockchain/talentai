# SEO / GEO Fix — Implementation Summary

## Problem

The landing page (`/`) was invisible to Google, Bing, and LLM crawlers (OpenAI, Perplexity, Anthropic, Gemini).

**Root causes:**
1. `_app.tsx` returned `null` server-side (`if (!isClient) return null`) — every page rendered empty HTML.
2. `pages/index.tsx` used `dynamic(..., { ssr: false })` — the home page body was an empty `<div id="__next">`.
3. All `<title>`, `<meta>`, Open Graph, and JSON-LD were injected client-side only (after JS hydration).
4. `robots.txt` pointed sitemap to `app.talentai.bid` (gated app) instead of `talentai.bid` (public landing).

---

## Files Changed

### `src/pages/index.tsx`
- Removed `dynamic(..., { ssr: false })` wrapper — page now server-side renders.
- Added `export const getStaticProps` — Next.js generates static HTML at build time.
- Added full `<Head>` block (server-rendered, visible in View Source / Ctrl+U):
  - `<title>` — "TalentAI | AI Recruitment Platform — Hire 75% Faster with Conversational AI Agents"
  - `<meta name="description">` — 155-char claim
  - `<link rel="canonical" href="https://talentai.bid/" />`
  - `<meta name="robots" content="index, follow" />`
  - Complete Open Graph tags (title, description, image 1200×630, url, type, site_name)
  - Twitter Card tags (summary_large_image)
  - 3 JSON-LD `<script type="application/ld+json">` blocks:
    - **Organization** (name, url, logo, contactPoint, sameAs LinkedIn)
    - **SoftwareApplication** (name, description, offers/pricing from $8/interview)
    - **FAQPage** (all 5 FAQ questions hardcoded — not i18n-dependent, always in HTML)

### `src/pages/_app.tsx`
- Removed `const [isClient, setIsClient] = useState(false)` and `if (!isClient) return null`.
- This was silently blocking SSR for **every page** in the app.

### `src/pages/_document.tsx`
- Added to the static `<Head>` (present before any JS):
  - `<meta charSet="utf-8" />`
  - `<meta name="theme-color" content="#0D9488" />`
  - `<link rel="icon" href="/images/home/favico.png" />`
  - `<link rel="shortcut icon" href="/favicon.ico" />`

### `public/robots.txt`
- Fixed sitemap URL: `app.talentai.bid` → `talentai.bid`
- Added explicit `Disallow` for private routes:
  - `/signin`, `/home/company/`, `/home/candidate/`, `/admin/`, `/api/`, `/_next/`, `/unauthorized`

### `public/sitemap.xml`
- Updated domain: `app.talentai.bid` → `talentai.bid`
- Updated `lastmod` dates to 2026-05-20
- Kept only publicly indexable pages: `/`, `/candidate`, `/resume-builder`
- Removed non-indexable pages: `/signin`, `/unauthorized`, `/linkedin-auth-callback`

### `public/sitemap-index.xml`
- Updated domain: `app.talentai.bid` → `talentai.bid`
- Removed the dynamic jobs sitemap reference (backend-side concern, add back when live)

---

## How to Verify

### 1. Raw HTML check (= what Google sees)
After `next build && next start`, open `https://talentai.bid` and press **Ctrl+U** (View Source).

You should see in the raw HTML:
```html
<title>TalentAI | AI Recruitment Platform...</title>
<meta name="description" content="..."/>
<link rel="canonical" href="https://talentai.bid/"/>
<meta property="og:title" content="..."/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"...}</script>
```
And the hero/section **text content** should also be visible in the source (not just `<div id="__next">`).

### 2. Structured data validation
Paste the URL into: https://search.google.com/test/rich-results

Expected results:
- FAQPage schema detected (5 questions)
- Organization schema detected
- SoftwareApplication schema detected

### 3. OG / Twitter preview
Paste URL into: https://www.opengraph.xyz

Expected: title, description, and image preview are populated.

### 4. Google Search Console (post-deploy)
1. Add property: `talentai.bid`
2. Submit sitemap: `https://talentai.bid/sitemap-index.xml`
3. Use "URL Inspection" on `/` and click "Request Indexing"

---

## Remaining recommendations

| Priority | Task | Notes |
|----------|------|-------|
| High | Create `/public/images/home/og-cover.png` | 1200×630px OG image — currently referenced but may not exist |
| High | Candidate page (`/candidate`) — add SSR + `<Head>` | Same treatment as `/` |
| Medium | Add `hreflang` tags for FR/EN | Site has i18n, tell Google about language variants |
| Medium | Add `next-sitemap` package | Auto-generates sitemap on build, keeps dates fresh |
| Low | Re-add dynamic jobs sitemap | Once backend `/api/sitemap-jobs.xml` is live on `talentai.bid` domain |
| Low | Submit to Bing Webmaster Tools | Independent from Google Search Console |
