# Brand brief — Cole Anderson

Source: design session #1 with Cole, 2026-08-23. This file is the record of what
Cole has said about his own practice and how he wants to be read. Everything in
`docs/design/specs/` is downstream of it — where a concept and this file disagree,
this file wins.

## Practice

**Object and photography.** Making things with his hands. Not moving image — an
earlier concept round assumed film and a director credit, and that was invented.
Nothing in the site should carry film vocabulary. Some pieces are artwork,
some are functional, some are both — Cole does not treat that as a split worth
resolving.

The stated _why_ is curiosity, and building his place in the world through the
things he makes. Not craft for its own sake and not a portfolio for hire.

> A website is not just a website. It is a persistent digital presence that people
> now and in the future will associate with you — the identity they attach to your
> name. That identity is the brand.

## Brand words

Cole's own, in his order:

- authentic
- purposeful / intentional
- process-led
- reflective
- curious

## What Cole finds authentic in other people's sites

Two things, and both are structural rather than stylistic:

1. **Process documentation.** The making is shown, not only the made thing.
2. **The person is visible in the feed.** Not everything on the site is a finished
   product or project. A human who does things, rather than a catalogue of outputs.

## Audience

Peers, collaborators, and employers in the product design industry.
**Collaborators are primary** — the site is written to them first.

## Avoid

- The cliché portfolio. Nothing specific named; the instinct is the point.
- **Reading as an online CV.** A site that exists to get him employed well. This is
  the sharpest of the avoidances and the easiest to fail by accident.
- **A dark mode button.** Note this names the widget, not a dark palette. A site
  committed to one dark ground does not violate it; a sun/moon toggle in the corner
  does.

## Five-year view

Cole expects the categories to change. He already finds the high-level labels
("object", "photography") uninspiring and wants to move toward material-specific
ones — "wool", "charcoal".

**Design consequence:** top-level navigation must not hardcode the current
categories. Whatever carries grouping has to be content-driven and replaceable
without a rebuild of the layout.

## Colour

Cole is choosing the palette. The agreed _structure_, not the values:

| Slot     | What it is             | Value |
| -------- | ---------------------- | ----- |
| Ground   | one neutral background | TBC   |
| Accent 1 | blue family            | TBC   |
| Accent 2 | rusty orange           | TBC   |

Two accents, not one. No concept route may assume a single-signal palette.

## Domain

Undecided. Likely `coleanderson.nz` or similar. Nothing is to be written into the
code — `deploy.yml` reads the `SITE_DOMAIN` repository variable and that stays the
only place a domain appears.

## Requirements this brief puts on the build

Carried out of the notes, because each of these is a structural decision and not a
visual preference:

1. **A play section.** Unfinished work, experiments, and things Cole likes but does
   not want mistaken for real projects. A second content tier, explicitly fenced off
   from the main body of work. Neither the current content model nor any concept
   route has one.
2. **Process is first-class content.** In-progress states, working shots, and
   material notes need somewhere to live that is not "another gallery image at the
   bottom of a project page".
3. **Grouping is data, not layout.** See the five-year view above.
4. **Two accents.**
5. **Not a CV.** Credits-first or list-of-roles framings are off the table by name.

## Open questions for Cole

Raised in session #1, unanswered:

- Is **play** a separate section with its own page, or a filter across one index?
- Does the work / play split want a flag on `project`, or a second Contentful type?
