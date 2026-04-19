# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Run production build locally
npm run lint      # Run ESLint
```

No test suite is configured.

## Architecture Overview

Portfolio site for Cole Anderson built with **Next.js App Router**, **Sanity CMS**, and **Tailwind CSS v4**.

### Routing & Pages

- `/` — Home: hero + project list sidebar layout
- `/project/[slug]` — Individual project pages (also rendered inline on home via client-side selection)
- `/about` — About page
- `/admin/edit` — Project list + "Pages" shortcuts (home / about / contact)
- `/admin/edit/[slug]` — Project editor (sections, free objects, page settings)
- `/admin/edit/home` — Homepage editor (selected projects + drag reorder)
- `/admin/edit/about` / `/admin/edit/contact` — Site-settings editors scoped per page

The home page uses a split layout: fixed left column (project list) + main content area. Clicking a project loads it without a full page reload; `/project/:slug` also works as a standalone deep link.

### Content Layer (Sanity)

All content lives in Sanity. Schema types are defined in `/sanity/schemas/`:

- **project** — slug, title, status (draft/published), sections, freeObjects, og_image, tags
- **siteSettings** — logo, bio, social links, contact, CV

Data is fetched via GROQ queries in `/lib/queries.ts` using the Sanity client from `/lib/sanity.ts`. After saves, on-demand ISR revalidation is triggered via `/api/revalidate`.

### Section System

Projects are composed of two overlay types:

1. **Sections** (`/components/sections/`) — Structured, responsive layout blocks: `heroSection`, `textSection`, `imageSection`, `gallerySection`, `videoSection`, `splitSection`. Rendered by `SectionRenderer.tsx`.
2. **Free Objects** — Absolutely positioned elements for creative desktop layouts: `freeImageObject`, `freeVideoObject`, `freeTextObject`. Rendered by `FreeObjectRenderer.tsx`. Mobile always uses stacked fallbacks.

### Admin Auth

Session auth is implemented in `/lib/adminAuth.ts` using the Web Crypto API with HMAC-SHA256 signing. Sessions expire after 7 days. The secret is set via `ADMIN_SECRET` env var.

### Image & Video Handling

- Images are served from Sanity CDN via `@sanity/image-url` with AVIF/WebP support
- Vimeo embeds use a facade pattern (lazy load) — see `/lib/vimeoOEmbed.ts` and `VideoSection`/`FreeVideoObject` components
- Video autoplay is desktop-only, muted, no autoplay on mobile

### SEO

- Structured data (schema.org `Person`, `WebSite`, `CreativeWork`) generated in `/lib/structured-data.ts`
- Dynamic sitemap at `/app/sitemap.ts`, robots at `/app/robots.ts`
- Title pattern: `Cole Anderson — [Project Title]` on project pages
- Each project needs unique `title`, `meta_description`, and `og_image`

## Environment Variables

```
NEXT_PUBLIC_SANITY_PROJECT_ID   # Sanity project ID
NEXT_PUBLIC_SANITY_DATASET      # Dataset (production)
NEXT_PUBLIC_SITE_URL            # Site domain (coleanderson.com)
NEXT_PUBLIC_SANITY_API_VERSION  # API version (2025-01-01)
ADMIN_SECRET                    # Session signing key
```

## Key Design Constraints

- **Desktop-first** — desktop layouts can use free-positioned objects; mobile always gets clean stacked fallbacks
- **Keep the editor simple** — do not build arbitrary pixel-perfect drag-and-drop; use the predefined section modules
- **Performance priority** — minimise client-side JS, lazy load all off-screen media, use AVIF/WebP
- **SEO priority** — consistent use of "Cole Anderson" in titles, structured data, and headings is intentional
