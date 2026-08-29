# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Commands

```bash
pnpm dev       # Dev server on :4321
pnpm build     # Static build to dist/
pnpm verify    # format:check + lint + astro check — run before calling anything done
pnpm check     # astro check on its own
```

Infrastructure is a separate pnpm project. Install and run it from inside
`infra/`, and use `pnpm exec cdk`, never `npx cdk`.

No test suite is configured.

## Architecture

Portfolio site for Cole Anderson: **Astro** static build, **Contentful** for
content, **Tailwind v4** for styling, **AWS** (S3 + CloudFront + Route 53) for
hosting, all defined in **CDK** under `infra/`.

Migrated off Next.js + Sanity + Vercel in August 2026. Nothing of that stack
remains.

### Content

Three Contentful types — `project`, `about`, `siteSettings` — declared in
`migrations/definitions/` as desired state and applied with `pnpm cf:migrate`.
Field ids live once in `src/lib/content-model.ts`; the migrations and
`src/lib/contentful-map.ts` both read them from there, so a rename cannot drift.

Every fetch happens at build time. `src/lib/contentful.ts` is the only module
that talks to Contentful, and it falls back to `src/lib/fallback-content.ts`
when the space is absent or empty — which is what lets the site build with no
credentials at all. A production build sets `REQUIRE_CMS_CONTENT=true` and
throws instead of falling back.

Raw Contentful shapes stop at `contentful-map.ts`. Templates see the types in
`content-types.ts` and never an entry. The one exception is `cmsId`, which
exists so `editable()` in `src/lib/preview.ts` can mark a DOM element as a
field for Contentful's inspector mode.

### Components

`components/ui/` are primitives with no content knowledge. `components/patterns/`
compose them. A primitive taking a rest spread declares
`[key: string]: unknown` and casts `Astro.props as Props` — Astro does not infer
`Props` on a component with a dynamic `<Tag>`, and `astro check` fails without
the cast.

Reach for `Link` rather than a bare `<a>`: it carries the external-link `rel`,
the "opens in a new tab" announcement, and `aria-current` — all easy to forget
and silent when forgotten.

### Styling

Every value comes from `src/styles/tokens.css`. §1 holds raw values, §2 aliases
them into Tailwind's namespaces, §3 holds tokens Tailwind has no namespace for. A
token declared in `@theme` under a namespace Tailwind does not have
(`--duration-`, `--z-`) emits no CSS and no error, so those are bridged by an
`@utility` in `global.css`.

**Colour is decided** — Cole's palette, recorded in `docs/design/brief.md` — and
it is the one part he can change himself: five fields on `siteSettings` become a
`<style>` block in `BaseLayout`. Everything else in the file is still provisional.

The override lands on §1 and not on the §2 names, and that is not a style
preference. §2 uses `@theme inline`, which compiles a utility down to the raw
variable it reads: `.bg-page` becomes `background-color: var(--raw-page)`, never
`var(--color-page)`. So setting a semantic name at runtime does nothing, with no
error, whether or not that name also reaches `:root`. §1 reads
`var(--cms-*, <default>)` so the override needs no cascade ordering to win;
`src/lib/theme.ts` records why that matters.

No colour literals outside `tokens.css`, and no opacity modifiers
(`bg-page/60`) at a use site — a tinted variant means a new token.

### Infrastructure

Six CDK stacks in `infra/`. The site stacks declare themselves only when
`zoneName`, `hostedZoneId` and `certificateArn` are all in context, so the app
still synthesises with none of them set. All three exist, the certificate is
`ISSUED`, the domain is delegated to Route 53 and everything is deployed.

**The apex is not this site.** `coleanderson.nz` and `www` are served by Cole's
Adobe Portfolio until this one replaces it; `test.coleanderson.nz` is this site.
The prod distribution and bucket stay deployed with no DNS pointing at them, so
the handover in either direction is a DNS change and nothing else. It is one
repository variable, `EXTERNAL_APEX_IPS` — read "Who serves the apex" in
`infra/README.md` before touching the apex records, the AAAA absence or the
stack dependency, each of which fails quietly if got wrong.

Read `infra/README.md` before changing anything there — `PRICE_CLASS_ALL`, the
real-404 behaviour, the OIDC provider import and the role-name suffixes each
exist for a reason recorded in it.

### Comments

The existing "why" comments are load-bearing — most record something that failed
silently. Leave them. New ones are for the same thing: a gotcha, a constraint
that is not visible from the code, a decision that looks arbitrary and is not.
Ordinary code gets none.

## Environment variables

```
CONTENTFUL_SPACE_ID             # Cole owns the space
CONTENTFUL_ENVIRONMENT          # master
CONTENTFUL_DELIVERY_TOKEN       # published entries
CONTENTFUL_PREVIEW_TOKEN        # drafts, test environment only
CONTENTFUL_USE_PREVIEW          # 'true' renders drafts; never true in production
CONTENTFUL_MANAGEMENT_TOKEN     # migrations only
REQUIRE_CMS_CONTENT             # 'true' fails the build on placeholder content
PUBLIC_SITE_URL                 # canonical origin for this build
PUBLIC_NOINDEX                  # 'true' noindexes every page (test only)
```

## The domain

`coleanderson.nz`, registered at domainsdirect.nz. No code path reads it from
this repo: `deploy.yml` reads the `SITE_DOMAIN` repository variable and the CDK
stacks read `zoneName` from context. Do not write the domain into the code to
"fix" a build or a stack that will not synthesise without it.

## Not decided yet

- **The design**, apart from the palette. Type, scale and layout are a neutral
  base to redesign against; the colour tokens are Cole's real values.
