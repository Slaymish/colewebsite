import { getClient, isSanityConfigured } from "./sanity";
import type { Project, ProjectSummary, SiteSettings } from "../types";

// GROQ queries

const PROJECT_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  status,
  created_at,
  category,
  tags,
  sidebarMode,
  cover_image { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
`;

const PROJECT_FULL_FIELDS = `
  ${PROJECT_SUMMARY_FIELDS},
  meta_description,
  og_image { ..., asset->{ _id, url, metadata { dimensions } } },
  sections[] {
    ...,
    _type == 'imageSection' => {
      image { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'gallerySection' => {
      images[] { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'splitSection' => {
      image { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'heroSection' => {
      backgroundImage { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'videoSection' => {
      poster { ..., asset->{ _id, url, metadata { dimensions } } },
      videoFile { asset->{ url } }
    }
  },
  freeObjects[] {
    ...,
    _type == 'freeImageObject' => {
      image { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'freeVideoObject' => {
      videoFile { asset->{ url } }
    }
  }
`;

export async function getAllPublishedProjects(): Promise<ProjectSummary[]> {
  if (!isSanityConfigured()) return [];
  return getClient().fetch(
    `*[_type == "project" && status == "published"] | order(created_at desc) { ${PROJECT_SUMMARY_FIELDS} }`,
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSanityConfigured()) return null;
  const results = await getClient().fetch<Project[]>(
    `*[_type == "project" && slug.current == $slug && status == "published"][0..0] { ${PROJECT_FULL_FIELDS} }`,
    { slug },
  );
  return results[0] ?? null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) return [];
  const results = await getClient().fetch<{ slug: { current: string } }[]>(
    `*[_type == "project" && status == "published"] { slug }`,
  );
  return results.map((p) => p.slug.current);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured()) return null;
  return getClient().fetch(`*[_type == "siteSettings"][0]`);
}

// Admin queries — fetch all projects regardless of status
export async function getAllProjectsForAdmin(): Promise<ProjectSummary[]> {
  if (!isSanityConfigured()) return [];
  return getClient().fetch(
    `*[_type == "project"] | order(created_at desc) { ${PROJECT_SUMMARY_FIELDS} }`,
  );
}

export async function getProjectBySlugForAdmin(
  slug: string,
): Promise<Project | null> {
  if (!isSanityConfigured()) return null;
  const results = await getClient().fetch<Project[]>(
    `*[_type == "project" && slug.current == $slug] | order(_updatedAt desc) [0..0] { ${PROJECT_FULL_FIELDS} }`,
    { slug },
  );
  return results[0] ?? null;
}
