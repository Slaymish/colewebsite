---
description: Astro component, page and styling conventions
paths:
  - "src/components/**"
  - "src/pages/**"
  - "src/layouts/**"
  - "src/styles/**"
---

# Components, pages and styling

## The two component tiers

`src/components/ui/` are primitives that know nothing about Cole or the CMS.
`src/components/patterns/` compose them and may take content types. A primitive
that imports from `content-types.ts` is in the wrong tier — see the note at the
top of `src/lib/ui.ts`.

Shared vocabulary between two or more primitives (`ImageAsset`, `Ratio`,
`isExternalHref`, `samePath`) lives in `src/lib/ui.ts`. A variant class map used
by one component stays in that component.

## Primitives that already solve the easy-to-forget thing

- `Link` — external `rel`, `target`, the spoken "(opens in a new tab)", and
  `aria-current`. Use it instead of a bare `<a>`; forgetting these is silent.
- `Figure` / `Placeholder` — take a `Ratio` name, not a ratio.
- `VisuallyHidden`, `SkipLink` — the announced-but-unseen cases.
- `Heading` — `level` is the document outline, `size` is how loud it looks. Never
  demote a level to get smaller type.

A primitive taking a rest spread declares `[key: string]: unknown` in `Props` and
reads `Astro.props as Props`. Astro does not infer `Props` on a component with a
dynamic `<Tag>`, and `astro check` fails without the cast.

## Styling

Every value comes from `src/styles/tokens.css`. §1 raw values are read only by §2;
components touch only §2 aliases. Colour is Cole's real palette and is overridable
from `siteSettings`; the type scale is still provisional.

- No colour literal outside `tokens.css`.
- No opacity modifier at a use site (`bg-page/60`). A tint means a new token.
- A token in a namespace Tailwind v4 does not have (`--duration-`, `--z-`) emits
  no CSS and no error. Those live in §3 and are bridged by an `@utility` in
  `global.css` — add both halves or the class silently does nothing.
- `@theme inline` compiles a utility down to the §1 variable it reads and never
  emits the §2 name, so a runtime override has to target §1. A new CMS-settable
  colour means a `--cms-*` fallback in §1 and an entry in `src/lib/theme.ts`.
- The operand order in the §1 `color-mix()` neutrals is load-bearing. See the
  comment there before making them consistent.

## Pages

Routes build statically. `getStaticPaths` passes the entry through `props` rather
than letting each page re-fetch it. Imports use the `~/*` alias, not relative
paths out of the directory.

Anything rendered from a CMS field should spread `editable('type', cmsId,
'field')` from `~/lib/preview` so Contentful's inspector mode can find it. It
returns nothing on production builds.
