/**
 * Contentful access. All calls happen at build time; nothing here ships to the
 * browser. Falls back to placeholder content while the space does not exist yet.
 */
import { createClient, type ContentfulClientApi } from 'contentful';
import { CONTENT_TYPE } from './content-model';
import type { About, Project, SiteSettings } from './content-types';
import { toAbout, toProject, toSiteSettings } from './contentful-map';
import { DEFAULT_SETTINGS, FALLBACK_ABOUT, FALLBACK_PROJECTS } from './fallback-content';

const space = import.meta.env.CONTENTFUL_SPACE_ID;
const usePreview = import.meta.env.CONTENTFUL_USE_PREVIEW === 'true';
const token = usePreview
  ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
  : import.meta.env.CONTENTFUL_DELIVERY_TOKEN;

export const isConfigured = Boolean(space && token);

/**
 * Production builds must never ship placeholder text, so empty content is a hard
 * error there. Every other build falls back and warns, which keeps `main` green
 * while the space is still being filled. Set only by the production deploy job.
 */
const requireContent = import.meta.env.REQUIRE_CMS_CONTENT === 'true';

/**
 * The single gate every getter below returns through, so all three ways of
 * ending up with no content are treated alike: absent credentials, a content
 * type that does not exist yet, and a type that exists but holds nothing
 * renderable.
 */
function missing<T>(what: string, fallback: T): T {
  if (requireContent) {
    throw new Error(
      `No published ${what} found in Contentful. A production build will not ` +
        'ship placeholder content.',
    );
  }
  // The unconfigured case announced itself once at module load. Repeating it for
  // every content type only teaches people to scroll past warnings.
  if (isConfigured) {
    console.warn(`[contentful] No ${what} yet — using placeholders.`);
  }
  return fallback;
}

let client: ContentfulClientApi<undefined> | null = null;

if (isConfigured) {
  client = createClient({
    space: space as string,
    accessToken: token as string,
    environment: import.meta.env.CONTENTFUL_ENVIRONMENT ?? 'master',
    host: usePreview ? 'preview.contentful.com' : 'cdn.contentful.com',
  });
} else {
  console.warn(
    '[contentful] No credentials found — building with placeholder content. ' +
      'Set CONTENTFUL_SPACE_ID and a token in .env to use real content.',
  );
}

/**
 * Returns null when the content type does not exist yet, which is the state
 * between creating the space and running the migrations. Callers fall back to
 * placeholders so the site stays buildable through setup. Any other failure
 * throws, because a real outage must not quietly ship a page of bracketed text.
 */
async function fetchEntries(
  contentType: string,
  order?: string,
): Promise<unknown[] | null> {
  if (!client) return null;
  try {
    const response = await client.getEntries({
      content_type: contentType,
      include: 2,
      limit: 200,
      ...(order ? { order: [order] } : {}),
    } as never);
    return response.items as unknown[];
  } catch (error) {
    if (isUnknownContentType(error)) {
      console.warn(
        `[contentful] Content type "${contentType}" does not exist yet — using ` +
          'placeholders. Run: pnpm cf:migrate -- --env ' +
          (import.meta.env.CONTENTFUL_ENVIRONMENT ?? 'master'),
      );
      return null;
    }
    throw error;
  }
}

function isUnknownContentType(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('unknownContentType') || message.includes('VALIDATION_FAILED');
}

/**
 * Every project, ordered by the CMS field rather than in a template, so Cole
 * controls the order without a deploy. Memoised: the index, every project page
 * and the sitemap all ask for the same list.
 */
let projectsPromise: Promise<Project[]> | null = null;

export function getProjects(): Promise<Project[]> {
  projectsPromise ??= fetchProjects();
  return projectsPromise;
}

async function fetchProjects(): Promise<Project[]> {
  const items = await fetchEntries(CONTENT_TYPE.project, 'fields.order');
  const projects = (items ?? [])
    .map(toProject)
    .filter((project): project is Project => project !== null);
  return projects.length > 0 ? projects : missing('projects', FALLBACK_PROJECTS);
}

/** The selected work on the homepage. Everything, if Cole has marked nothing. */
export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  return featured.length > 0 ? featured : projects;
}

export async function getProject(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getAbout(): Promise<About> {
  const items = await fetchEntries(CONTENT_TYPE.about);
  const about = (items ?? []).map(toAbout).find((a): a is About => a !== null);
  return about ?? missing('About entry', FALLBACK_ABOUT);
}

/**
 * Site settings. Read by `BaseLayout` on every page, so the promise is memoised:
 * without it a ten-page build makes ten identical requests for one entry. The
 * cache is per build, and a build is the only lifetime there is.
 */
let settingsPromise: Promise<SiteSettings> | null = null;

export function getSiteSettings(): Promise<SiteSettings> {
  settingsPromise ??= fetchSiteSettings();
  return settingsPromise;
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  const items = await fetchEntries(CONTENT_TYPE.siteSettings);
  const settings = (items ?? [])
    .map(toSiteSettings)
    .find((s): s is SiteSettings => s !== null);

  return settings ?? missing('site settings', DEFAULT_SETTINGS);
}
