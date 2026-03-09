## Tech Stack

### Frontend / app framework

**→ Next.js (App Router) + TypeScript**

Why:

- Best balance of SEO + performance + dev speed.
- Hybrid rendering lets you statically generate projects but still keep CMS previews.
- Easy routing for `/project/:slug`.
- Image optimisation built-in.
- You already know React; no learning tax.

Avoid Remix here. Nice, but less ecosystem momentum and fewer CMS integrations.

---

### CMS

**→ Sanity**

Why:

- Best editorial UX for non-technical users.
- Strong structured content model fits your “modules not chaos” approach.
- Live preview works cleanly with Next.
- Image handling + transforms included.
- Version history + drafts already solved.

Do **not** build your own CMS. Waste of time.

Avoid Strapi unless you need heavy relational logic (you don’t).

---

### Styling

**→ Tailwind CSS**

Why:

- Fastest iteration for layout-heavy work.
- Keeps CSS surface small.
- Perfect for modular responsive layout system.

Avoid heavy component libraries. This is mostly custom layout anyway.

---

### Layout approach (important decision)

**→ Modular layout system (not freeform DnD).**

Implement:

- Section-based schema in Sanity:
  - hero
  - single image
  - gallery
  - text
  - video
  - split layout

- Optional advanced module with positioning only for desktop.

This matches the brief and won’t create support debt.

---

### Media handling

**→ Sanity assets + Cloudinary (optional later)**

Start with Sanity only:

- automatic transforms
- responsive image sizes
- easy uploads

Only add Cloudinary if performance actually becomes a problem.

---

### Video

**→ Vimeo embeds**

Reasons:

- best compression
- cleaner UX
- avoids hosting pain

Self-host only if necessary.

---

### SEO setup

Handled inside Next:

- Metadata API for titles/meta
- dynamic OG images (optional but nice later)
- sitemap via `next-sitemap`
- structured data via JSON-LD

This will comfortably rank for “Cole Anderson”.

---

### Analytics

**→ Plausible**

Why:

- lightweight
- privacy-friendly
- no cookie banner drama
- enough data for portfolio use

GA4 only if client explicitly wants detail.

---

### Hosting / infra

**→ Vercel**

Why:

- seamless Next deploy
- previews for every PR
- zero ops overhead
- fast globally (fine for NZ audience)

---

### Auth (admin access)

Handled via **Sanity Studio auth**, not your app.

Do NOT build `/admin` routes inside Next.
Instead:

- deploy Sanity Studio at `/studio`
- restrict access via Sanity auth

Cleaner and less work.

---

## Final stack summary (clean)

- Framework: **Next.js (App Router, TypeScript)**
- CMS: **Sanity**
- Styling: **Tailwind CSS**
- Media: **Sanity assets**
- Video: **Vimeo embeds**
- Analytics: **Plausible**
- Hosting: **Vercel**
- SEO tooling: **next-sitemap + JSON-LD**

---

## Why this is the right level

This stack:

- maximises simplicity (client priority)
- preserves flexibility via modules
- guarantees strong SEO
- avoids overengineering
- keeps your build time realistic

Most importantly: you won’t hate maintaining it in six months.
