/**
 * The content model. These types are the contract the Contentful migrations in
 * migrations/definitions/ must satisfy.
 */
import type { ImageAsset } from './ui';

export type { ImageAsset };

export interface Project {
  /** Contentful entry id. Empty for placeholder content. See lib/preview.ts. */
  cmsId: string;
  slug: string;
  title: string;
  /** Plain strings, one per paragraph. Blank lines in the CMS separate them. */
  body: string[];
  /** Groups projects in the index, e.g. 'Film', 'Photography'. */
  category: string | null;
  tags: string[];
  cover: ImageAsset | null;
  gallery: ImageAsset[];
  /** 1200x630 card for link previews. Falls back to the cover, then the site default. */
  shareImage: ImageAsset | null;
  metaDescription: string | null;
  /** Whether this project appears in the selected work on the homepage. */
  featured: boolean;
  order: number;
}

export interface About {
  cmsId: string;
  body: string[];
  portrait: ImageAsset | null;
  email: string | null;
}

/**
 * Site settings — one entry, read by every page.
 *
 * Configuration rather than copy: the SEO defaults, the contact details and the
 * links that become `sameAs` in the Person JSON-LD. Grouped rather than flat,
 * because a settings bag of a dozen sibling fields reads as a list of unrelated
 * knobs — `settings.seo.description` says which knob.
 *
 * Every value is nullable, and null means "use the built-in default" rather than
 * "empty". A half-filled entry is a legitimate state.
 */
export interface SiteSettings {
  cmsId: string;
  /** A line or two under the name. The homepage and the footer both read it. */
  bio: string | null;
  seo: {
    description: string | null;
    /** 1200x630 card used wherever a page supplies none of its own. */
    shareImage: ImageAsset | null;
    /** Drives the Person JSON-LD. */
    jobTitle: string | null;
    /** Each becomes a sameAs link — Instagram, Vimeo, anything public. */
    profiles: string[];
  };
  contact: {
    email: string | null;
    phone: string | null;
    /** A PDF in Contentful, or nothing. */
    cvUrl: string | null;
  };
  copyright: string | null;
}
