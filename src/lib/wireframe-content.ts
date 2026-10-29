/**
 * Content that exists only so the wireframe has something to point at.
 *
 * None of this is Cole's, none of it is real, and all of it is bracketed on
 * screen for the same reason `fallback-content.ts` is: nothing here should read
 * as finished. It exists because two of the decided routes have no content type
 * behind them yet — there is no `photoSet` in Contentful, so `/photography` and
 * `/photography/<slug>` would otherwise be empty shells with no shape to look at.
 *
 * Delete this module when the content model catches up. The `<PhotoSet>` shape
 * below is a proposal for what the migration would need, not a settled one: see
 * docs/design/wireframe.md.
 */

export interface WireframePhotoSet {
  slug: string;
  /** Working title only — the naming of sets is Cole's, not ours. */
  title: string;
  /** How many photographs the set holds. A count, because the pictures do not exist. */
  count: number;
  year: string | null;
}

export const WIREFRAME_PHOTO_SETS: WireframePhotoSet[] = [
  { slug: 'set-one', title: '[First photo set]', count: 12, year: null },
  { slug: 'set-two', title: '[Second photo set]', count: 8, year: null },
  { slug: 'set-three', title: '[Third photo set]', count: 20, year: null },
  { slug: 'set-four', title: '[Fourth photo set]', count: 5, year: null },
];

export function getWireframePhotoSet(slug: string): WireframePhotoSet | null {
  return WIREFRAME_PHOTO_SETS.find((set) => set.slug === slug) ?? null;
}

/**
 * Decisions the wireframe has to assume something about in order to draw a page.
 * Each one is open in docs/design/wireframe.md; change the number here, not in a
 * template, so the assumption stays in one place.
 */
export const WIREFRAME = {
  /**
   * How many featured pieces it takes before the carousel exists at all.
   *
   * Below this the homepage/design page links straight to the work cloud and
   * there is no featured section — a wheel with two slides in it reads as a
   * mistake, and Cole has no featured work on day one. Three is the smallest
   * number that survives a hop to the next slide without emptying the arc.
   */
  featuredMinimum: 3,
} as const;
