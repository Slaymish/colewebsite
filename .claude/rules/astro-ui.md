---
description: Astro page and styling conventions on the stripped wireframe branch
paths:
  - "src/pages/**"
  - "src/layouts/**"
  - "src/styles/**"
---

# Pages and styling

This branch has no design. The first design round — primitives, patterns, the
token layer, the Tailwind entry and both typefaces — was removed, and what
replaced it is an unstyled wireframe of the decided structure. Read
`docs/design/wireframe.md` first; it is the sitemap plus the questions each page
is waiting on.

## Pages

- **Plain HTML per route.** No components on this branch. A wireframe factored
  into reusable pieces has already started making layout decisions, which is the
  one thing it is not allowed to do. Components come back with the design round.
- **Every block is labelled.** A `<section aria-labelledby>` per block, with a
  `.wire-label` naming it and a `.wire-note` saying what has to happen in it or
  what is still undecided. That annotation is the deliverable, not clutter.
- **No invented copy about Cole.** Content is the CMS's job. `[Bracketed]` text is
  a slot, and it stays bracketed.
- Routes build statically. `getStaticPaths` passes the entry through `props`
  rather than letting each page re-fetch it. Imports use the `~/*` alias, not
  relative paths out of the directory.
- Anything rendered from a CMS field should spread `editable('type', cmsId,
  'field')` from `~/lib/preview` so Contentful's inspector mode can find it. It
  returns nothing on production builds.

## Styling

One stylesheet, `src/styles/wireframe.css`: dashed boxes for unbuilt areas, a
system monospace face, grey labels, and the two grids the structure needs.

- It is **throwaway**. The old rules — tokens only, no colour literals, no opacity
  modifiers — do not apply here, and do not reintroduce a token layer on top of
  it. When the design round starts, this file is deleted rather than grown.
- Nothing in it is a proposal: no brand colour, no typeface, no scale, no motion.
  Cole's palette lives in `docs/design/brief.md` and in the `lib/theme.ts` bridge,
  which is kept and not rendered.
- Layout in it exists only to describe structure — a grid of photo sets, a row of
  slides. Anything beyond that is a design decision being made by accident.
