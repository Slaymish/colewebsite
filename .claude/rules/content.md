---
description: Contentful content model, mapping and build-time fetching
paths:
  - "src/lib/**"
  - "migrations/**"
  - "scripts/**"
---

# Content layer

## One vocabulary, read from both sides

`src/lib/content-model.ts` holds every content-type id, slug rule and length
limit. `migrations/definitions/*.ts` and `src/lib/contentful-map.ts` both import
from it so the rule cannot drift. Never address a content type or field by a bare
string.

Contentful validates on write and never revisits an entry published before a rule
arrived, so a field rule usually needs both halves: the migration validation and
a build-time guard.

Adding or renaming a field touches four files: `content-model.ts`,
`migrations/definitions/`, `content-types.ts`, `contentful-map.ts` — and
`fallback-content.ts` must still satisfy the type.

## The boundary

Raw Contentful entries stop at `contentful-map.ts`. Templates see the types in
`content-types.ts` and never an entry. The single exception is `cmsId`, which
exists so `editable()` can mark a DOM element for inspector mode.

`contentful.ts` is the only module that talks to Contentful, and every call
happens at build time — nothing here ships to the browser.

## Falling back

A missing token, a missing content type and an empty type all return through
`missing()`, which throws when `REQUIRE_CMS_CONTENT=true` (production only) and
falls back otherwise. That is what lets the site build against no Contentful space
at all. Placeholder strings are bracketed and images are absent on purpose —
nothing in `fallback-content.ts` should read as finished.

## Migrations and scripts

`pnpm cf:migrate` writes to Cole's live Contentful space and needs
`CONTENTFUL_MANAGEMENT_TOKEN`. Say what it will change before running it.
Migration definitions declare desired state, so they must stay re-runnable.
