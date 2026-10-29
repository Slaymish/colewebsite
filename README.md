# coleanderson

Portfolio site for Cole Anderson. Static build, headless CMS, served from S3
behind CloudFront.

**This branch is a reset, not a design.** The first design round has been removed
and replaced with an unstyled wireframe of the decided structure. Read
`docs/design/wireframe.md` before changing anything here — it carries the sitemap,
the routes, and the open questions each page is waiting on. `docs/design/brief.md`
is still the authority on what the site is for.

## Running it

```bash
pnpm install
cp .env.example .env    # works without credentials — placeholder content
pnpm dev                # http://localhost:4321
```

Without Contentful credentials the site builds against
`src/lib/fallback-content.ts`, so it runs before the CMS space exists. Bracketed
placeholders and dashed boxes are deliberate: nothing should read as finished
when it is not.

| Command                         | Does                                    |
| ------------------------------- | --------------------------------------- |
| `pnpm dev`                      | Dev server                              |
| `pnpm build`                    | Static build to `dist/`                 |
| `pnpm verify`                   | Format check, lint, and `astro check`   |
| `pnpm cf:migrate -- --env test` | Rehearse the content model              |
| `pnpm cf:migrate -- --yes`      | Apply the content model to master       |
| `pnpm cf:preview`               | Put an "Open preview" button on entries |
| `pnpm cf:webhook`               | Wire publishing to a rebuild            |

## Routes

`/` · `/design` · `/photography` · `/work/<slug>` · `/photography/<slug>` ·
`/contact` · a real `/404`, and `/sitemap` — the wireframe's own map, not part of
the site.

```
src/
  layouts/BaseLayout.astro  the shell: head, SEO, JSON-LD, wireframe chrome
  lib/                      content model, Contentful access, SEO helpers
  pages/                    routes
  styles/wireframe.css      dashed boxes and a monospace face. Not a design system.
infra/                      CDK app — buckets, distributions, DNS, CI roles
migrations/                 Contentful content model, declared as desired state
```

There are no components on this branch. Every page is plain HTML in one file, on
purpose: a wireframe that has been factored into reusable pieces has already
started making layout decisions.

## What is not decided yet

**The design, entirely.** No palette, typeface, scale, grid or motion. Colour
tokens, the Tailwind utility layer, both fonts and every primitive were removed
with the first design round. `lib/theme.ts` still exists — the CMS palette is
framework, not design — but nothing renders it.

## Rules that bite

- **`src/styles/wireframe.css` is throwaway.** Nothing goes in it that is worth
  keeping, and it is deleted when the next design round starts. It is already
  breaking the old "no hardcoded values" rule, deliberately.
- **The domain lives in settings, not in a file.** It is `coleanderson.nz`, and
  no code path reads it from this repo: the build reads `PUBLIC_SITE_URL`,
  `deploy.yml` builds that from the `SITE_DOMAIN` repository variable, and the
  CDK site stacks take theirs from context. Deciding it was a settings change;
  changing it should be one too.
- **Content is the CMS's job.** No copy about Cole gets invented in this repo.
  `src/lib/wireframe-content.ts` is the one exception and says so in its header:
  it exists because `/photography` has no content type behind it yet.
- **Contentful shapes stop at `contentful-map.ts`.** Templates see the types in
  `content-types.ts` and never a raw entry, so swapping CMS touches one module.

## Deploying

Push to `main` builds and deploys to `test.<domain>`, which is behind basic auth
and reads Contentful's Preview API so drafts are visible. Test builds tolerate
missing content and fall back to placeholders; production builds set
`REQUIRE_CMS_CONTENT=true` and fail rather than ship a bracketed placeholder to
the real domain. Production is a manual `workflow_dispatch` and never deploys on
its own. Infrastructure changes run from their own workflow and are never
triggered by a content push.

Both are no-ops until the infrastructure exists: the deploy job reads the site
stack's outputs, and a stack that is not there yet is reported as a skip rather
than a failure. Setup order is in `infra/README.md`.
