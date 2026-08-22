/**
 * Metadata for link previews and search results.
 *
 * A client's first impression is often the card that renders when the URL is
 * pasted into an email or a DM, not the site itself.
 */
import { SITE } from './site';

export interface SeoInput {
  title: string;
  description?: string;
  /** Absolute or site-relative URL to a 1200x630 image. */
  image?: string;
  path: string;
  noindex?: boolean;
}

export interface Seo {
  title: string;
  description: string;
  /**
   * Null when neither the page nor site settings names one. There is no
   * built-in default card: a hardcoded `/og-default.png` that nobody has drawn
   * yet is an `og:image` tag pointing at a 404, which reads worse in a link
   * preview than no tag at all. Add the file and a `DEFAULT_OG_IMAGE` here
   * together, or set the share image in site settings.
   */
  image: string | null;
  canonical: string;
  noindex: boolean;
}

/**
 * Site-wide SEO defaults from the CMS, for pages that supply none of their own.
 * They sit between the page and the constants in `lib/site.ts`, so the built-in
 * values stay as the last resort rather than being replaced by an empty field.
 */
export interface SeoDefaults {
  description?: string | null;
  image?: string | null;
}

export function buildSeo(input: SeoInput, defaults: SeoDefaults = {}): Seo {
  const isHome = input.path === '/';
  return {
    // Distinct, human page titles. "Home" is not a page title.
    title: isHome ? `${SITE.name} — ${SITE.jobTitle}` : `${SITE.name} — ${input.title}`,
    description: input.description ?? defaults.description ?? SITE.description,
    image: absolute(input.image ?? defaults.image),
    canonical: new URL(input.path, SITE.origin).href,
    // The test environment sets this globally; production must never inherit it.
    noindex: input.noindex ?? import.meta.env.PUBLIC_NOINDEX === 'true',
  };
}

function absolute(url: string | null | undefined): string | null {
  return url ? new URL(url, SITE.origin).href : null;
}

/** Ties the site to his name when someone searches it. */
export function personJsonLd(
  jobTitle: string,
  description: string,
  profiles: readonly string[] = SITE.profiles,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    jobTitle,
    description,
    url: SITE.origin,
    address: { '@type': 'PostalAddress', addressCountry: 'NZ' },
    ...(profiles.length > 0 ? { sameAs: profiles } : {}),
  };
}

/** One project, so a shared project link can render as the work rather than the site. */
export function creativeWorkJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.title,
    description: input.description,
    url: new URL(input.path, SITE.origin).href,
    ...(input.image ? { image: new URL(input.image, SITE.origin).href } : {}),
    creator: { '@type': 'Person', name: SITE.name, url: SITE.origin },
  };
}
