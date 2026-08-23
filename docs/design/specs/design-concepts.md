# Three routes — Cole Anderson portfolio

> **Status: superseded, 2026-08-23.** Written before session #1 with Cole. All three
> routes were drawn from an assumed practice — film and photography, positioned as a
> working director. Cole's own account is **object and photography**, for an audience
> of product-design collaborators. Beyond the subject mismatch, every route fails at
> least two requirements the brief now sets. Read `docs/design/brief.md` first; it is
> the authority. Kept here because the routes are still useful as a record of what was
> tried and why it does not fit — see **Reconciliation** at the bottom before reusing
> anything from them.
>
> The rendered board at `docs/design/specs/concepts-board.html` shows these same three
> routes and is superseded with them.

Low-fidelity concept exploration. Nothing here is chosen yet; `src/styles/tokens.css`
stays provisional until one route is picked and developed into a full spec.

**Surface type.** A portfolio is not a marketing page and not an app. It is an
index plus a set of long-form project pages. The route decides which of those two
carries the identity.

**Subject constraints that shaped all three.** Cole works across film and
photography, so the index has to hold two kinds of thing without ranking them.
Project metadata is real and structural — year, format, role, gauge — which means
it can carry hierarchy instead of being decoration. No client names appear in any
route: listing brands Cole may not have worked with fabricates a credential, and
title / year / format / role is a complete credit on its own.

---

## Route A — Call Sheet

**Personality.** A production index, not a gallery. Dark, dense, typographic. The
work reads as a body of credits before it reads as pictures.

| Decision      | Value                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| Display       | Archivo (variable, `wdth` 64 / `wght` 700)                                |
| Utility       | Geist Mono 400, uppercase, for year / format / role only                  |
| Ground        | `#0E1113` cold near-black                                                 |
| Ink / muted   | `#EDF0F0` / `#7E8A8C`                                                     |
| Rule          | `#23292B`                                                                 |
| Signal        | `#F2A33C` tungsten amber — active row marker and focus ring, nothing else |
| Density       | Dense                                                                     |
| Shape         | Sharp. No radius anywhere.                                                |
| Surface model | Flat. Separation by hairline rule, never by card.                         |

**Memorable element.** The homepage is a full-height index of rows. Moving through
it swaps a single large still in a fixed frame on the right. One image on screen at
a time, and it changes as you read — the opposite of a thumbnail grid.

**Motion.** One crossfade, 180ms, on the preview frame. Row title nudges 8px right
on hover. Nothing else moves.

**Why it isn't generic.** No cards, no grid, no hero. The metadata columns are the
layout. It borrows from a call sheet and an edit bin, which is Cole's actual
working world.

**States.** Empty index → the rules and column headers stay, one row reads
"Nothing published yet." Preview frame holds its aspect and shows the tone block
until the still decodes, so the layout never jumps.

**Risk.** Hover-to-preview does not exist on touch. Mobile is a different layout,
not a squeeze: 1:1 thumbnail left, title and year right. Budget for building both.

---

## Route B — Plate

**Personality.** An exhibition monograph. Paper, enormous margins, one plate at a
time. Quiet to the point of severity.

| Decision      | Value                                                                           |
| ------------- | ------------------------------------------------------------------------------- |
| Display       | Bodoni Moda 400 / italic (fallback: Newsreader if the Didone reads too fashion) |
| Body          | Libre Franklin 300/400                                                          |
| Ground        | `#F2F1ED` grey bone — deliberately not a warm cream                             |
| Ink / muted   | `#171512` / `#6A665E`                                                           |
| Rule          | `#DCDAD3` hairline                                                              |
| Accent        | `#2A3A73` ultramarine — folio numbers and one link underline                    |
| Density       | Sparse                                                                          |
| Shape         | Sharp, but soft-edged by whitespace rather than radius                          |
| Surface model | Single surface. No panels, no elevation, no shadow.                             |

**Memorable element.** A left margin column that behaves like the gutter of a
printed book: it carries the running folio, and the folio counts up as you scroll.
Captions sit in that margin beside their plate, never underneath it.

**Motion.** Effectively none. The folio number is the only thing that changes, and
it steps rather than animates.

**Why it isn't generic.** The AI-slop serif page is warm cream + humanist serif +
terracotta. This is grey bone + a high-contrast Didone + ultramarine, with the
content column pushed off-centre and 25% of the width given to a margin that holds
almost nothing.

**States.** Empty → the margin, folio and rules still draw; the plate area holds
one tone block with "No plates yet" set in the caption position.

**Risk.** The severity only works if the photography is strong and consistently
cropped. Weak or mixed-quality plates have nowhere to hide. Confirm the archive
before committing.

---

## Route C — Light Table

**Personality.** A physical work surface. Slides in white mounts, scattered at
angles on an illuminated grey-green table. You drag the table rather than scroll a
page.

| Decision      | Value                                                                          |
| ------------- | ------------------------------------------------------------------------------ |
| Display       | Fraunces (variable, `opsz` on, `wght` 500)                                     |
| Body          | DM Sans 400/500                                                                |
| Table         | `#C6CDC7` cool illuminated grey-green                                          |
| Mount         | `#F4F6F3`                                                                      |
| Ink / muted   | `#1E2420` / `#5B655F`                                                          |
| Chinagraph    | `#C4402C` — the grease-pencil loop marking the selected slide                  |
| Density       | Balanced, but spatially rather than vertically                                 |
| Shape         | Mounts are rectangles with a 2px radius; the chinagraph loop is the only curve |
| Surface model | One plane, objects on it, real drop shadows from the mounts                    |

**Memorable element.** No page scroll at all. The site is a plane you pan. Selecting
a project draws a chinagraph loop around its slide — the mark a photographer
actually makes on a contact sheet.

**Motion.** Drag with inertia (disabled under `prefers-reduced-motion`). The
chinagraph loop draws in over 320ms via `stroke-dashoffset`. Clicking a slide
scales it up in place into the project view rather than navigating away.

**Why it isn't generic.** Almost no portfolio abandons the scroll. Doing it here is
justified: a photographer's edit genuinely is a spatial task, and the loop is
domain vocabulary rather than an invented accent.

**States.** Empty → an empty table with one mount reading "Nothing on the table
yet." Slides render as their tone block first and resolve to the still; position
never depends on load order.

**Risk.** The heaviest of the three. Needs a keyboard model (arrow keys move
selection, the table pans to follow), an always-present Index button opening a
plain list, and a real answer for deep links. Do not pick this route unless the
build budget covers all three.

---

## Reconciliation with the brief

Five requirements come out of session #1. None of the three routes was designed
against them.

| Requirement                     | Route A — Call Sheet        | Route B — Plate               | Route C — Light Table                 |
| ------------------------------- | --------------------------- | ----------------------------- | ------------------------------------- |
| Object-making, not film         | fails — role, format, gauge | survives — plates are neutral | fails — slides, mounts, contact sheet |
| A play tier                     | absent                      | absent                        | absent                                |
| Process and the person visible  | fails — outputs only        | fails by design               | partial — a table holds scraps        |
| Grouping replaceable, not fixed | partial — columns are data  | partial                       | fails — position is the layout        |
| Two accents                     | one signal only             | one accent only               | one chinagraph mark only              |
| Not an online CV                | fails — "a body of credits" | passes                        | passes                                |

Route by route:

- **Call Sheet** is the closest of the three to the thing Cole named as the sharpest
  avoidance. "Credits first, pictures second" and "a body of credits" is an online CV
  with better typography. Its metadata columns are film-crew fields an object-maker
  does not have. Dead.
- **Plate** has the least wrong subject premise — a plate is a plate whatever made it
  — but it is built to hide process. Its own risk note says the severity only holds if
  the work is strong and consistently cropped, which is the opposite of showing the
  unfinished and the in-progress. Dead as a whole; the margin-column idea is the one
  salvageable part, because a persistent margin is a natural home for process notes.
- **Light Table** is analogue-photography furniture end to end and cannot hold objects
  without becoming a metaphor about a metaphor. Dead. What survives is the instinct
  that a spatial, non-linear surface suits a body of work with no natural ranking —
  which is also the best fit for a play tier that must not read as ranked against the
  real projects.

Not to over-read: **"a dark mode button" names the widget, not a dark palette.** A
route committed to a single dark ground is not disqualified by that line.

## What the next round has to satisfy

1. Object and photography together, with neither subordinate, and with room for the
   material-specific labels Cole expects to want within five years.
2. A play tier that is legible as second-class without being hidden or apologetic.
3. Process as first-class content, not a gallery appended to a finished project.
4. A palette of one neutral ground and two accents — blue and rusty orange — with the
   values coming from Cole. Concepts express these as slots, never as hex.
5. No credits-first framing.

## Choosing — how the original three were positioned

Retained for the record. The positioning question below is what the three were built
to answer; the brief has since answered part of it, and the answer is not any of them.

The three differ on every axis, so the choice is a positioning question rather than
a taste one:

- **Call Sheet** positions Cole as a working director — credits first, pictures second.
- **Plate** positions him as a photographer with an archive worth publishing as a book.
- **Light Table** positions him as someone who makes unusual things, and proves it in the first five seconds.

Next step is a fresh round drawn against `docs/design/brief.md`, not a pick from
these three. Once a route from that round is chosen: a full design spec at
`docs/design/specs/design-<route>.md`, then `tokens.css` §1 replaced wholesale —
with Cole's palette values, not placeholders.
