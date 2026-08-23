/**
 * The vocabulary the CMS and the build both speak.
 *
 * Content-type ids and the field rules that exist in two places at once: once as
 * a Contentful validation, so Cole is stopped as he types, and once as a
 * build-time guard, because Contentful validates on write and never revisits an
 * entry published before a rule arrived.
 *
 * Both halves import from here, so the rule cannot drift.
 */

/** Every content type in the space, so nothing is addressed by a bare string. */
export const CONTENT_TYPE = {
  project: 'project',
  note: 'note',
  about: 'about',
  siteSettings: 'siteSettings',
} as const;

export type ContentTypeId = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

/**
 * A slug becomes a whole path segment. One containing a slash, a colon or a
 * space does not fail on its own entry — it takes the entire build down with
 * `TypeError: Missing parameter: slug` from Astro's router, naming no entry.
 * Seen in the wild: a URL pasted into the slug field.
 */
export const SLUG_PATTERN = '^[a-z0-9]+(?:-[a-z0-9]+)*$';

export const SLUG_REGEX = new RegExp(SLUG_PATTERN);

/** Shown under the field in Contentful when the rule is broken. Cole's words. */
export const SLUG_MESSAGE =
  'Lowercase letters, numbers and hyphens only, e.g. texture-becomes-person. ' +
  'No spaces, no full web addresses.';

/**
 * Length caps, in one place because the help text quotes them. Contentful counts
 * characters, so these are characters and not words.
 */
export const LIMIT = {
  projectBody: 2000,
  // Contentful's Symbol type is hard-capped at 256 characters; anything above
  // that is rejected at migrate time, not caught here.
  noteCaption: 200,
  metaDescription: 160,
  bio: 400,
  aboutBody: 3000,
  jobTitle: 60,
  copyright: 120,
} as const;

/**
 * The space has exactly one locale and it is `en-US` — not `en-NZ`, and not
 * `SITE.locale`, which is the underscored Open Graph form. Inspector mode
 * silently matches nothing if this disagrees with the space.
 */
export const CMS_LOCALE = 'en-US';

/**
 * Field ids per content type, so a template asking Contentful to highlight a
 * field cannot name one that does not exist. Inspector mode fails silently on a
 * wrong id — the element simply is not clickable — so the ids are typed here and
 * the migrations read the same list.
 */
export const FIELDS = {
  project: [
    'title',
    'slug',
    'body',
    'tier',
    'tags',
    'cover',
    'gallery',
    'process',
    'shareImage',
    'metaDescription',
    'featured',
    'order',
  ],
  note: ['image', 'caption', 'date'],
  about: ['internalName', 'body', 'portrait', 'email'],
  siteSettings: [
    'internalName',
    'bio',
    'metaDescription',
    'shareImage',
    'jobTitle',
    'profiles',
    'contactEmail',
    'contactPhone',
    'cv',
    'copyright',
  ],
} as const satisfies Record<ContentTypeId, readonly string[]>;

export type FieldOf<K extends ContentTypeId> = (typeof FIELDS)[K][number];

/**
 * What kind of thing an entry is. `play` is unfinished work and experiments —
 * shown, but never mistaken for a finished project. A play item can be promoted
 * by changing this field alone, which is why the tier is not in the URL.
 */
export const TIER = {
  project: 'project',
  play: 'play',
} as const;

export type Tier = (typeof TIER)[keyof typeof TIER];

export const TIERS = [TIER.project, TIER.play] as const;
