# Content model — decisions from session #1

Downstream of `docs/design/brief.md`. Settles the three questions the brief left
open, before any visual round starts. Nothing here has been applied to Cole's
space; see **Applying** at the bottom.

## 1. Play is a tier on `project`, not a second type

**Decided.** A `tier` field on `project`, values `project` and `play`.

The deciding argument is promotion. A play item may eventually be finished, or Cole
may simply become happy with it, and want it raised to a real project. With a
second content type that means creating a new entry, re-linking every asset, and
changing the URL — which breaks any link already shared. With a tier field it is
one dropdown, and `/project/<slug>` stays exactly as it was.

That is also why the URL does not change between tiers. The fence Cole wants —
"don't mistake this for a real project" — is presentational: a label on the item
and a section in the index. Encoding it in the path buys nothing and costs the
promotion path.

### `featured` stays a separate field

`tier` answers _what kind of thing is this_. `featured` answers _does it show on
the homepage_. They stay orthogonal, and a **featured play item is a legitimate
and wanted state** — it is the most direct expression of the thing Cole named as
authentic in other people's sites: not everything shown is a finished product.
Folding the two into one three-value field would make that state unrepresentable.

It also leaves `contentful.ts` alone — `featured.length > 0 ? featured : projects`
keeps working, and the behaviour already promised to Cole in the field help ("with
none switched on, the homepage shows everything") holds for both tiers.

### Known costs

- **One `order` space across both tiers.** `order` is required and the two tiers
  render in different places, so numbers not colliding is an accident rather than a
  guarantee. Fine in practice; worth remembering before anything sorts across both.
- **Play items show project-shaped fields.** Contentful has no conditional field
  display, so a play item still offers `metaDescription`, `shareImage` and
  `featured`. Accepted friction, not a surprise.

## 2. Process is a linked `note` type

**Decided.** A small `note` content type — image, caption, optional date — and a
`process` reference array on `project`.

The constraint named was that it must stay easy for Cole to make a new project.
A reference array meets that directly: it can be left completely empty, and
creating a project requires no interaction with it at all. Projects carry varying
amounts of process, and several carry none.

The reason it is a linked type rather than fields on `project` is not the project
page — it is the index. The brief asks for the person to be visible in the feed,
with not everything on show being a finished product. Notes that are entries can be
queried on their own and placed between projects in an index. Fields buried inside
a project cannot. Structure also survives a design round that has not happened yet:
a structured note can be rendered as a plain flow later, but structure cannot be
recovered from a prose blob.

Rejected alternatives:

- **Fields on `project`** (`processImages` + `processNotes`) — cannot pair a note to
  its image, and cannot surface in a feed.
- **Rich text with embedded assets** — the nicest thing to write into, but the site
  has no rich-text renderer today, and it hands the design a blob rather than data.

## 3. `category` goes; `tags` carries grouping

**Decided.** Drop `category` from the definition. `tags` is already free-form and
multi-valued, and its help text changes to say it is what groups work on the site.

Cole has said the current labels are uninspiring and that he expects to move to
material-specific ones — wool, charcoal. A single-valued `category` forces a false
choice the moment a piece is both wool and photography. This is the brief's
"grouping is data, not layout" requirement, and `category` was the one thing in the
model that fought it.

`category` was never actually grouping anything — it rendered as an eyebrow label
on the card and the project page, nothing more.

**Cole's existing `category` values are not deleted.** The field is dropped from the
definition, `reconcile.ts` reports it as an orphan, and it is deliberately not
pruned: those values are the only record of how Cole has been labelling his work so
far, and that is input to the material-tags direction.

## Safe to ship before the migration runs

Nothing here changes what a visitor sees until Cole edits content. An unmigrated
space has no `tier` and no `process`, so `toTier(undefined)` returns `project` and
`fields.process ?? []` returns nothing — every page renders exactly as it did
before. That is what makes deploying this ahead of `pnpm cf:migrate` safe.

Two consequences worth knowing before that stops being true:

- **The Play nav item is deliberately not added.** `/play` exists and builds, but
  linking it from the primary nav puts "Nothing here yet." one click from the
  homepage. `REQUIRE_CMS_CONTENT` will not catch it, because an empty `getPlay()`
  never routes through `missing()`. Add the nav entry when there is play content,
  or during the design round when the navigation is decided properly.
- **An all-play space renders an empty homepage.** `getWork()` would be empty,
  `getFeaturedProjects()` falls back to it, and "Selected work" draws with nothing
  in it. The production guard does not fire, because `getProjects()` did find
  entries. Before `tier` existed, any project at all meant the homepage had
  content; that guarantee is gone and nothing replaces it yet.

## Applying

The definitions in `migrations/definitions/` declare desired state; running them is
separate and has **not** been done. `pnpm cf:migrate` writes to Cole's space, so it
is his call and not something to run in passing.

Folded into that same run, so there is only one: the two stale help-text strings
that told Cole his work is film. `01-project.ts` offered "Film, Photography, Design"
as category examples, and `03-site-settings.ts` offered "Director and Photographer"
as a job title. Both were invented by the superseded concept round.

Do not run `--prune` on this migration. See `category` above.
