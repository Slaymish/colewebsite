/**
 * Site-wide constants. Anything user-visible that is not content lives here.
 *
 * Most of these are last resorts rather than the value the page uses: site
 * settings can override the description, the share image and the job title from
 * Contentful. What stays here is what a build with no CMS at all still needs.
 */

export const SITE = {
  name: 'Cole Anderson',
  /**
   * Canonical origin for this build, set per environment. There is deliberately
   * no production default even now the domain exists — a build that forgets to
   * set it gets localhost rather than stamping a plausible-looking lie into
   * every canonical tag.
   */
  origin: import.meta.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
  /**
   * Last-resort OG description. Site settings is where Cole's own words go.
   *
   * It said "film, photography and design" until 2026-08-24. That was left over
   * from the concept round that assumed a director, and docs/design/brief.md is
   * explicit that nothing on the site carries film vocabulary.
   */
  description:
    'Objects, photographs, and the making of them. Cole Anderson, Aotearoa New Zealand.',
  locale: 'en_NZ',
  /** Drives the Person JSON-LD when site settings names no other. */
  jobTitle: 'Designer | Photographer',
  /** Site settings supplies these now; each becomes a sameAs link. */
  profiles: [] as string[],
} as const;

/**
 * There is no top-level navigation, on purpose. The homepage is a sequence of
 * full-page sections that are entered by scrolling, and the only routes out of
 * it are the two CTAs and the footer word. Nothing renders a nav, so there is
 * nothing to keep in step here.
 *
 * Where a single piece lives still has to be one answer, so the route shapes are
 * here rather than repeated in each template.
 */
export const ROUTES = {
  home: '/',
  design: '/design',
  work: (slug: string) => `/work/${slug}`,
  photography: '/photography',
  photoSet: (slug: string) => `/photography/${slug}`,
  contact: '/contact',
} as const;

/** True when this build renders unpublished Contentful entries. */
export const IS_PREVIEW = import.meta.env.CONTENTFUL_USE_PREVIEW === 'true';
