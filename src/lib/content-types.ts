/**
 * The content model. These types are the contract the Contentful migrations in
 * migrations/definitions/ must satisfy.
 */
import type { Tier } from './content-model';
import type { ImageAsset } from './ui';

export type { ImageAsset };

/** One moment of process — a picture from partway through, and a line about it. */
export interface ProcessNote {
  cmsId: string;
  image: ImageAsset;
  caption: string;
  /** ISO date, or null. Notes without one keep their authored order. */
  date: string | null;
}

export interface Project {
  /** Contentful entry id. Empty for placeholder content. See lib/preview.ts. */
  cmsId: string;
  slug: string;
  title: string;
  /** Plain strings, one per paragraph. Blank lines in the CMS separate them. */
  body: string[];
  /**
   * Project or play. Play is unfinished work and experiments — shown, but never
   * ranked alongside finished projects. Promotion is a change to this field and
   * nothing else, which is why the slug does not encode it.
   */
  tier: Tier;
  /** What the piece is made of or made with. This is what groups work. */
  tags: string[];
  cover: ImageAsset | null;
  gallery: ImageAsset[];
  /** Empty on anything with no process worth showing. */
  process: ProcessNote[];
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
 * The palette, from the CMS rather than the stylesheet.
 *
 * The slots are the ones `docs/design/brief.md` agreed with Cole — one neutral
 * ground, two accents — plus ink, and a darker variant of the blue accent. The
 * derived neutrals (`ink-muted`, `rule`, `placeholder`) are deliberately absent:
 * they are mixed off ink and ground in `src/styles/tokens.css`, so re-grounding
 * the site re-tunes all three rather than leaving three greys behind.
 *
 * Null means "use the value in tokens.css", so a half-filled palette is a
 * legitimate state and an empty one leaves the site exactly as it builds today.
 */
export interface SiteTheme {
  /** The one neutral everything sits on. */
  ground: string | null;
  ink: string | null;
  /** Accent 1 in the brief — the blue. */
  accent: string | null;
  /** Accent 1, darker. */
  accentDeep: string | null;
  /** Accent 2 in the brief — the rusty orange. */
  accentWarm: string | null;
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
    /** Each becomes a sameAs link — Instagram, anything public. */
    profiles: string[];
  };
  contact: {
    email: string | null;
    phone: string | null;
    /** A PDF in Contentful, or nothing. */
    cvUrl: string | null;
  };
  copyright: string | null;
  theme: SiteTheme;
}
