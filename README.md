# coleanderson

Portfolio site for Cole Anderson. Static build, headless CMS, served from S3
behind CloudFront.

**The home hero and oversized homepage links are the first design pass.** The
remaining content stays a wireframe of the decided structure. Read
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

`/` · `/illustrations` · `/design` · `/photography` · `/work/<slug>` · `/photography/<slug>` ·
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

The home hero lives in `src/components/HomeHero.astro`, with scoped styling.
The remaining wireframe sections stay as plain HTML in their route files.

### Home hero

Edit `HERO_PHRASES` in `src/lib/hero.ts` to change the available words. Each entry
has a middle-line `modifier` and a full `label` for screen readers. The visible
first and last lines remain "I am" and "human".

Add `hero_*.svg` files to `src/assets/` to expand the illustration pool; no import
list needs updating. SVGs render as blue silhouettes using their transparency.
The browser picks a phrase and illustration independently on every page load,
so consecutive reloads can repeat. Without JavaScript,
the first phrase and illustration remain visible.

Illustrations rotate at full opacity in every build. `HERO_ROTATION` in
`src/lib/hero.ts` sets the defaults: 0.65 seconds per illustration, or 4 seconds
when reduced motion is enabled. There is a pause/resume control; animation stops
while the hero is offscreen or the tab is hidden. Living ink has been removed.

Click the hero illustration to open `/illustrations`. Scroll to fly through the
artwork in depth, or choose **View all** for a grid. Reduced motion and JavaScript-free
visits use the grid. The selected view and camera/grid position persist across
visits and reloads in the current tab. A blocking, same-origin preference bootstrap
and pre-snapshot initialization prevent a grid/fly-through flash. Selecting an illustration opens `/?illustration=hero_N`, pauses
rotation on that illustration until Resume is pressed. Every `hero_*.svg` automatically
joins both the rotation and gallery.

In development and noindex preview builds, the bottom-right **Site lab** exposes
both rotation intervals and the background texture, scale and strength. Paper is
the provisional default; film grain remains an alternative. Textures are static,
apply in production too, and persist across routes in the current tab. Lab settings
are written to URL parameters for sharing; the public build uses the rotation
constants. The panel is absent without `PUBLIC_NOINDEX=true` in production.

`src/lib/hero/experiment.ts` owns rotation and lab wiring; the gallery lives in
`src/pages/illustrations.astro` and `src/lib/illustration-gallery.ts`. The text keeps
its reserved area separate from artwork. Responsive type sizes are set entirely in
CSS so they render at their final size on the first paint, with no JavaScript resizing.
`src/lib/site-texture.ts` owns background textures; `src/styles/site.css` owns the
shared background, display font and panel animation. Astro's `ClientRouter` keeps
navigation in the document: new content slides in from the right and closes back
to the right, with URLs, browser history and direct page entry preserved. Transitions
capture the visible viewport so a CTA opens directly without travelling via the
hero. Design, Photography and Contact occupy positions one viewport to the right
of their homepage sections. Both snapshots pan together, using the CTA's vertical
offset for a direct diagonal path when it is off-centre. Back always moves straight
left and lands centred on the parent section, including browser Back and nested
work/photo-set routes. It deliberately does not restore the old off-centre position.
Pointer navigation does not steal keyboard focus or move the gallery camera. Reduced
motion swaps content without the slide.

`src/lib/scroll.ts` integrates Lenis for wheel and programmatic scrolling; touch
keeps native inertia and reduced motion keeps native scrolling. The engine is
disposed before route capture and re-created once the new page is ready, avoiding
residual momentum and font-width changes. The lab scrolls natively inside its own
container. Gallery transforms use the same scroll-frame updates.

UI controls use the local Lucide SVGs through `src/components/Icon.astro` and the
shared `.icon-control` style. Icon-only controls have accessible names, native
tooltips and 44px targets. The icon license ships at `public/licenses/lucide.txt`.

## What is not decided yet

**The design beyond the home hero.** No wider typeface, scale, grid or motion system. Colour
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
