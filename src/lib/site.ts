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
  /** Last-resort OG description. Site settings is where Cole's own words go. */
  description:
    'Portfolio of Cole Anderson — film, photography and design from Aotearoa New Zealand.',
  locale: 'en_NZ',
  /** Drives the Person JSON-LD when site settings names no other. */
  jobTitle: 'Director and Photographer',
  /** Site settings supplies these now; each becomes a sameAs link. */
  profiles: [] as string[],
} as const;

export const NAV: readonly { readonly href: string; readonly label: string }[] = [
  { href: '/', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** True when this build renders unpublished Contentful entries. */
export const IS_PREVIEW = import.meta.env.CONTENTFUL_USE_PREVIEW === 'true';
