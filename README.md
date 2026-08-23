# coleanderson

Portfolio site for Cole Anderson. Static build, headless CMS, served from S3
behind CloudFront.

## Running it

```bash
pnpm install
cp .env.example .env    # works without credentials — placeholder content
pnpm dev                # http://localhost:4321
```

Without Contentful credentials the site builds against
`src/lib/fallback-content.ts`, so it runs before the CMS space exists. Bracketed
placeholders and dashed grey boxes are deliberate: nothing should read as
finished when it is not.

| Command                         | Does                                    |
| ------------------------------- | --------------------------------------- |
| `pnpm dev`                      | Dev server                              |
| `pnpm build`                    | Static build to `dist/`                 |
| `pnpm verify`                   | Format check, lint, and `astro check`   |
| `pnpm cf:migrate -- --env test` | Rehearse the content model              |
| `pnpm cf:migrate -- --yes`      | Apply the content model to master       |
| `pnpm cf:preview`               | Put an "Open preview" button on entries |
| `pnpm cf:webhook`               | Wire publishing to a rebuild            |

## Layout

```
src/
  components/ui/        primitives — no content knowledge, no layout opinions
  components/patterns/  composed pieces built from the primitives
  layouts/              page shell, metadata, JSON-LD
  lib/                  content model, Contentful access, SEO helpers
  pages/                routes
  styles/tokens.css     every colour, size, duration and easing
infra/                  CDK app — buckets, distributions, DNS, CI roles
migrations/             Contentful content model, declared as desired state
```

Routes are `/`, `/about`, `/contact`, `/project/<slug>` and a real `/404`.

## What is not decided yet

**The design.** Everything in `src/styles/tokens.css` is scaffolding with the
right shape — near-black on off-white, a system font stack, a plain scale. Nobody
has chosen a palette, a typeface or a type scale. The components are a neutral
base to redesign against, not a look.

## Rules that bite

- **No hardcoded design values.** Colour, type, spacing, duration and easing all
  come from `src/styles/tokens.css`. A tinted or dimmed variant means adding a
  token, never an opacity modifier at the use site.
- **A token only goes in `@theme` if Tailwind has that namespace.** It has no
  `--duration-` or `--z-`; those live in `tokens.css` §3 and are bridged by an
  `@utility` in `global.css`. Getting this wrong emits no CSS and no error.
- **The domain lives in settings, not in a file.** It is `coleanderson.nz`, and
  no code path reads it from this repo: the build reads `PUBLIC_SITE_URL`,
  `deploy.yml` builds that from the `SITE_DOMAIN` repository variable, and the
  CDK site stacks take theirs from context. Deciding it was a settings change;
  changing it should be one too.
- **Content is the CMS's job.** No copy about Cole gets invented in this repo.
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
