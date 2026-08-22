# Content model

The Contentful content model, declared as **desired state**. Definitions live in
`definitions/`, and `run.ts` reconciles a space toward them.

```bash
pnpm cf:migrate -- --env test    # rehearse somewhere safe
pnpm cf:migrate -- --yes         # apply to master
pnpm cf:migrate -- project       # only definitions matching "project"
pnpm cf:migrate -- --prune       # report fields no definition claims
```

Runs are **idempotent**. Changing a field means editing the definition that owns
it and running this again — never adding a numbered file. `reconcile.ts` wraps
the `contentful-migration` DSL in a Proxy that rewrites `createField` to
`editField` (and back) against a snapshot of the live model, which is what makes
a re-run a no-op.

Removing a field from a definition does **not** remove it from Contentful. It is
reported as an orphan and left alone, because deleting a field deletes whatever
Cole wrote in it. `--prune --apply` is the only path that deletes.

## The three types

| Type           | What it holds                                          |
| -------------- | ------------------------------------------------------ |
| `project`      | One piece of work. `featured` puts it on the homepage. |
| `about`        | The about page. One entry.                             |
| `siteSettings` | SEO defaults, contact details, links. One entry.       |

Field ids are declared once in `src/lib/content-model.ts` and read from there by
both halves — the definitions here and the mapping in `src/lib/contentful-map.ts`
— so a rename cannot drift between the CMS and the build.

Field help text is written to Cole in second person. A description under the
field is the only guidance he gets while editing; anything written in this repo
he will never see.

## Requires a management token

`CONTENTFUL_MANAGEMENT_TOKEN` in `.env`, which is a different credential from the
delivery and preview tokens the site builds with. The runner refuses to touch
`master` without `--yes`.
