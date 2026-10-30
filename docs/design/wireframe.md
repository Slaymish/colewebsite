# Wireframe — structure and open questions

Branch: `lofi/wireframe`. This file is the record of one step: the site's design
was removed, and what replaced it is a set of pages that show only structure.
Nothing here is a visual proposal. Where this file and `brief.md` disagree,
`brief.md` wins — it is Cole's own words.

## What was removed

Everything from the first design round:

- `src/components/ui/` and `src/components/patterns/` — primitives and composed
  pieces. Both carried layout and styling, so both went.
- `src/styles/tokens.css` and `global.css` — the token layer, the Tailwind entry,
  and the palette bridge.
- Both typefaces (`@fontsource-variable/archivo`,
  `@fontsource-variable/jetbrains-mono`), removed from `package.json` too.
- `lib/theme.ts` is **kept but no longer rendered**. The CMS palette plumbing is
  framework, not design; it comes back when a design round starts.

## What was kept

Infrastructure and framework, untouched: `infra/` (six CDK stacks),
`migrations/`, `.github/workflows/`, `astro.config.mjs`, the Contentful boundary
(`lib/contentful.ts`, `contentful-map.ts`, `content-model.ts`,
`content-types.ts`, `fallback-content.ts`), the SEO builders, the preview/inspector
helper, `robots.txt.ts`, and the deploy and auth functions.

The only stylesheet left is `src/styles/wireframe.css`: dashed boxes, a monospace
face, grey labels. It exists to draw structure and is deleted when the next design
round starts.

## Sitemap

```
/
├── Hero              "I am human" — animated illustration + wordmark
├── Design CTA        slides over to /design
├── Photography CTA   slides over to /photography
├── What makes me human   about Cole — red ground, revealed out of a masked star on scroll
├── Contact CTA       → /contact
└── Footer            one word, "contact", as the link

/design
├── Featured work     carousel wheel, one slide focused, "See all" underneath
└── Work cloud        every piece; hover focuses, click enters, scroll continues
                      → /work/<slug>

/photography
└── Grid of photo sets
                      → /photography/<slug>

/work/<slug>          title, materials, cover, body, gallery, process, prev/next
/photography/<slug>   cover, photographs, prev/next set
/contact              one address; no form
/404                  real page
```

There is no top-level navigation: the homepage is entered by scrolling and left
through the two CTAs and the footer word, and every section is a full page,
centred. The cookies disclaimer sits on every page. `/sitemap` renders this same
map on the site itself and is not part of it, so nothing links to it.

## Features

**Featured work wheel.** A carousel of slides on an arc, one focused at a time,
with "See all" beneath going to the work cloud. It renders only when enough
pieces are flagged `featured`; below that the block does not exist and the page
links straight to the cloud. The threshold is one constant,
`WIREFRAME.featuredMinimum` in `src/lib/wireframe-content.ts`.

The count is of _explicitly_ featured pieces, not `getFeaturedProjects()` — that
falls back to "all finished work" when nothing is flagged, which would put a wheel
on a site where Cole has featured nothing.

**Cookies disclaimer.** One silly line, rendered closed on every page. No dismiss
handler: the static build's CSP sends `script-src 'self'` with no
`'unsafe-inline'`, so dismissal needs a bundled script and a stored preference —
a decision to make with the copy.

## The content model does not cover this yet

Two routes have nothing behind them:

1. **No `photoSet` type.** `/photography` and `/photography/<slug>` are drawn from
   `src/lib/wireframe-content.ts`, which is bracketed placeholders. The shape the
   pages need is roughly: `slug`, `title?`, `year?`, ordered `photographs[]`,
   optional `cover`.
2. **No ordering for the wheel.** `featured` is a boolean, so the wheel has no
   sequence and no way to say which slide is the first one focused. That needs
   either a `featuredOrder` field or a reference list on `siteSettings`.
3. **Junk drawer.** `play` is still a tier on `project` with no route. Either it
   gets one, it folds into the work cloud as a marker, or the field is retired.

Nothing here has been applied to Cole's space. `pnpm cf:migrate -- --env test`
rehearses whatever the migrations say, and they do not say any of this yet.

## Open questions

Structural, not visual — the ones that change a route or a content type:

1. **Order of the six homepage blocks.** Written down in the copy's order, not a
   decided sequence.
2. **URL shape for a piece.** `/work/<slug>` is assumed. `/design/<slug>` and a
   flat `/<slug>` are both consistent with `/design` carrying the cloud.
3. **Does the wheel live on `/` or `/design`?** Placed on `/design` here because
   the homepage copy does not mention it.
4. **What "enough" means for the wheel** — three is a placeholder.
5. **Slide-over or navigation.** Both CTAs are described as sliding over; if they
   really overlay, `/design` and `/photography` still need to exist as URLs for
   sharing and search.
6. **Is "What makes me human" a section or a route?** It is a section on `/` here.
7. **Is the footer word enough on its own?** There is no separate contact CTA
   block now, so the footer is the only way out of the homepage into /contact.
8. **Do single photographs that belong to no set have a home?**
9. **Does a piece open as a page at all,** or as a slide-over from the cloud?
