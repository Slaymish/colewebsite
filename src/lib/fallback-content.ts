/**
 * Placeholder content, used when Contentful is unreachable or empty.
 *
 * It exists so the site builds and runs before the space does — and so a missing
 * entry is visible rather than an empty page. Every string is bracketed and every
 * image is absent on purpose: nothing here should read as finished, and
 * `Placeholder` draws a dashed grey box wherever a picture is missing.
 *
 * A production build refuses to ship any of it. See REQUIRE_CMS_CONTENT in
 * contentful.ts.
 */
import { TIER } from './content-model';
import type { About, Project, SiteSettings } from './content-types';

export const FALLBACK_PROJECTS: Project[] = [
  {
    cmsId: '',
    slug: 'first-project',
    title: '[First project]',
    body: [
      '[Two or three paragraphs about the project — what it was, what Cole did on it, ' +
        'and what it was for. This is placeholder text: nothing here comes from the CMS.]',
    ],
    tier: TIER.project,
    tags: [],
    cover: null,
    gallery: [],
    // Empty rather than invented: a ProcessNote requires a real image, and
    // there are none here on purpose.
    process: [],
    shareImage: null,
    metaDescription: null,
    featured: true,
    order: 1,
  },
  {
    cmsId: '',
    slug: 'second-project',
    title: '[Second project]',
    body: ['[Another project. Add real ones in Contentful and these disappear.]'],
    tier: TIER.project,
    tags: [],
    cover: null,
    gallery: [],
    process: [],
    shareImage: null,
    metaDescription: null,
    featured: true,
    order: 2,
  },
  {
    cmsId: '',
    slug: 'first-play-piece',
    title: '[Something from Play]',
    body: ['[An experiment, or something unfinished. It is not a project.]'],
    tier: TIER.play,
    tags: [],
    cover: null,
    gallery: [],
    process: [],
    shareImage: null,
    metaDescription: null,
    featured: false,
    order: 3,
  },
];

export const FALLBACK_ABOUT: About = {
  cmsId: '',
  body: [
    '[A few paragraphs about Cole — the work he takes on, how he works, and where ' +
      'he is based. Written in Contentful, not here.]',
  ],
  portrait: null,
  email: null,
};

/**
 * What every page falls back to, field by field. Null throughout rather than
 * bracketed text, because these are configuration: an unset job title should
 * leave `SITE.jobTitle` to answer, not print `[Job title]` into the JSON-LD.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  cmsId: '',
  bio: null,
  seo: { description: null, shareImage: null, jobTitle: null, profiles: [] },
  contact: { email: null, phone: null, cvUrl: null },
  copyright: null,
  // Null throughout, and so the palette in tokens.css stands. Those values are
  // Cole's chosen ones, so a build with no CMS is the right colours rather than
  // placeholder ones.
  theme: { ground: null, ink: null, accent: null, accentDeep: null, accentWarm: null },
};
