/**
 * Maps raw Contentful entries onto the types in content-types.ts.
 *
 * Every Contentful-shaped object is confined to this file, so templates never
 * see a CMS shape and swapping CMS later touches one module. The field ids below
 * must stay in step with the definitions in migrations/definitions/.
 */
import { SLUG_REGEX, TIER, type Tier } from './content-model';
import type {
  About,
  ImageAsset,
  ProcessNote,
  Project,
  SiteSettings,
} from './content-types';

/** Minimal shapes for what we actually read, rather than the SDK's full generics. */
interface RawAsset {
  fields?: {
    title?: string;
    description?: string;
    file?: {
      url?: string;
      details?: { image?: { width?: number; height?: number } };
    };
  };
}

interface RawEntry<F> {
  sys: { id: string };
  fields: F;
}

/** Contentful returns protocol-relative asset URLs. */
export function toImage(asset: unknown): ImageAsset | null {
  const raw = asset as RawAsset | undefined;
  const file = raw?.fields?.file;
  const url = file?.url;
  const width = file?.details?.image?.width;
  const height = file?.details?.image?.height;

  if (!url || !width || !height) return null;

  return {
    url: absolute(url),
    width,
    height,
    // Description is the alt text field in Contentful's asset editor. Falling
    // back to the title beats an empty alt on a portfolio of visual work.
    alt: raw?.fields?.description ?? raw?.fields?.title ?? '',
  };
}

/**
 * A non-image asset — the CV. `toImage` refuses it, and rightly: there are no
 * pixel dimensions to read, so everything that renders one would be guessing.
 */
export function toFileUrl(asset: unknown): string | null {
  const url = (asset as RawAsset | undefined)?.fields?.file?.url;
  return url ? absolute(url) : null;
}

function absolute(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url;
}

/** Long-text fields hold the whole description; blank lines separate paragraphs. */
export function toParagraphs(text: unknown): string[] {
  if (typeof text !== 'string') return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function toStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : [];
}

/** Empty strings are how Contentful reports a field someone cleared. */
function orNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Contentful validates on write and never revisits an entry published before a
 * rule arrived, so the same rule is checked again here. Rejecting at this point
 * means one unusable entry drops out with a warning naming it, rather than
 * taking the whole build down with `TypeError: Missing parameter: slug` from
 * Astro's router, which names nothing.
 *
 * Production still refuses to ship, because dropping every entry of a type
 * routes through `missing()` in contentful.ts.
 */
function usableSlug(slug: unknown, title: unknown, kind: string): slug is string {
  if (typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
    console.warn(
      `[contentful] Skipping ${kind} "${String(title)}" — slug ${JSON.stringify(slug)} ` +
        'is not a URL segment. Use lower-case words separated by hyphens.',
    );
    return false;
  }
  return true;
}

interface NoteFields {
  image?: unknown;
  caption?: string;
  date?: string;
}

/**
 * A note with no usable image is dropped rather than rendered captionless — the
 * picture is the point of a process note.
 */
export function toProcessNote(entry: unknown): ProcessNote | null {
  const raw = entry as RawEntry<NoteFields> | undefined;
  const image = toImage(raw?.fields?.image);
  const caption = orNull(raw?.fields?.caption);
  if (!raw || !image || !caption) return null;

  return { cmsId: raw.sys.id, image, caption, date: orNull(raw.fields.date) };
}

/**
 * Anything unset reads as a project. The field arrived after entries already
 * existed, and those entries are projects — see the comment on `tier` in
 * migrations/definitions/01-project.ts.
 */
function toTier(value: unknown): Tier {
  return value === TIER.play ? TIER.play : TIER.project;
}

interface ProjectFields {
  title?: string;
  slug?: string;
  body?: string;
  tier?: string;
  tags?: unknown[];
  cover?: unknown;
  gallery?: unknown[];
  process?: unknown[];
  shareImage?: unknown;
  metaDescription?: string;
  featured?: boolean;
  order?: number;
}

export function toProject(entry: unknown): Project | null {
  const raw = entry as RawEntry<ProjectFields> | undefined;
  const fields = raw?.fields;
  if (!raw || !fields?.title) return null;
  if (!usableSlug(fields.slug, fields.title, 'project')) return null;

  return {
    cmsId: raw.sys.id,
    slug: fields.slug,
    title: fields.title,
    body: toParagraphs(fields.body),
    tier: toTier(fields.tier),
    tags: toStrings(fields.tags),
    cover: toImage(fields.cover),
    gallery: (fields.gallery ?? [])
      .map(toImage)
      .filter((image): image is ImageAsset => image !== null),
    process: (fields.process ?? [])
      .map(toProcessNote)
      .filter((note): note is ProcessNote => note !== null),
    shareImage: toImage(fields.shareImage),
    metaDescription: orNull(fields.metaDescription),
    featured: fields.featured === true,
    order: fields.order ?? 0,
  };
}

interface AboutFields {
  body?: string;
  portrait?: unknown;
  email?: string;
}

export function toAbout(entry: unknown): About | null {
  const raw = entry as RawEntry<AboutFields> | undefined;
  if (!raw?.fields) return null;

  const body = toParagraphs(raw.fields.body);
  if (body.length === 0) return null;

  return {
    cmsId: raw.sys.id,
    body,
    portrait: toImage(raw.fields.portrait),
    email: orNull(raw.fields.email),
  };
}

interface SiteSettingsFields {
  bio?: string;
  metaDescription?: string;
  shareImage?: unknown;
  jobTitle?: string;
  profiles?: unknown[];
  contactEmail?: string;
  contactPhone?: string;
  cv?: unknown;
  copyright?: string;
}

export function toSiteSettings(entry: unknown): SiteSettings | null {
  const raw = entry as RawEntry<SiteSettingsFields> | undefined;
  if (!raw?.fields) return null;

  return {
    cmsId: raw.sys.id,
    bio: orNull(raw.fields.bio),
    seo: {
      description: orNull(raw.fields.metaDescription),
      shareImage: toImage(raw.fields.shareImage),
      jobTitle: orNull(raw.fields.jobTitle),
      profiles: toStrings(raw.fields.profiles),
    },
    contact: {
      email: orNull(raw.fields.contactEmail),
      phone: orNull(raw.fields.contactPhone),
      cvUrl: toFileUrl(raw.fields.cv),
    },
    copyright: orNull(raw.fields.copyright),
  };
}
