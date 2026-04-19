import { createClient } from "next-sanity";
import type { Section, FreeObject, SanityImage, SocialLink, SiteSettings } from "../types";

export function getWriteClient() {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_TOKEN is not set. Add it to your .env.local file.");
  }
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
    useCdn: false,
    token,
  });
}

/**
 * GROQ queries expand asset references (asset->{ _id, url, metadata... }).
 * Sanity cannot store those expanded fields — only _ref and _type belong on a reference.
 * This recursively strips the extra fields so the patch is clean.
 */
function stripExpandedAssets(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stripExpandedAssets);

  const obj = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    if (key === "asset" && obj[key] && typeof obj[key] === "object") {
      const ref = obj[key] as Record<string, unknown>;
      const refValue = ref._ref ?? ref._id;

      if (refValue) {
        // Normalize any expanded asset objects (with _id or _ref) to a plain reference
        result[key] = { _type: ref._type ?? "reference", _ref: refValue };
        continue;
      }
    }

    result[key] = stripExpandedAssets(obj[key]);
  }

  return result;
}

export interface SaveProjectPayload {
  projectId: string;
  sections: Section[];
  freeObjects?: FreeObject[];
  status?: "draft" | "published";
  title?: string;
  meta_description?: string;
  category?: string;
  tags?: string[];
  isSelectedOnHome?: boolean;
  homeOrder?: number;
  cover_image?: SanityImage | null;
  og_image?: SanityImage | null;
}

export async function saveProject(payload: SaveProjectPayload): Promise<void> {
  const client = getWriteClient();

  // Strip expanded asset data before writing — Sanity only accepts plain references
  const cleanSections = stripExpandedAssets(payload.sections) as Section[];

  const cleanFreeObjects = stripExpandedAssets(payload.freeObjects ?? []) as FreeObject[];

  const patch: Record<string, unknown> = {
    sections: cleanSections,
    freeObjects: cleanFreeObjects,
  };

  if (payload.status !== undefined) patch.status = payload.status;
  if (payload.title !== undefined) patch.title = payload.title;
  if (payload.meta_description !== undefined) patch.meta_description = payload.meta_description;
  if (payload.category !== undefined) patch.category = payload.category || null;
  if (payload.tags !== undefined) patch.tags = payload.tags;
  if (payload.isSelectedOnHome !== undefined) patch.isSelectedOnHome = payload.isSelectedOnHome;
  if (payload.homeOrder !== undefined) patch.homeOrder = payload.homeOrder;
  if (payload.cover_image !== undefined) {
    patch.cover_image = stripExpandedAssets(payload.cover_image) as SanityImage | null;
  }
  if (payload.og_image !== undefined) {
    patch.og_image = stripExpandedAssets(payload.og_image) as SanityImage | null;
  }

  await client.patch(payload.projectId).set(patch).commit();
}

export interface CreateProjectPayload {
  title: string;
  slug: string;
}

export interface CreatedProject {
  _id: string;
  title: string;
  slug: { _type: "slug"; current: string };
  status: "draft";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 96);
}

export async function createProject(payload: CreateProjectPayload): Promise<CreatedProject> {
  const client = getWriteClient();
  const title = payload.title.trim() || "Untitled project";
  const rawSlug = slugify(payload.slug || payload.title) || `project-${Date.now()}`;

  // Ensure uniqueness by checking existing slugs and appending a suffix if needed
  const existing = await client.fetch<string[]>(
    `*[_type == "project" && slug.current match $pattern].slug.current`,
    { pattern: `${rawSlug}*` },
  );
  let slug = rawSlug;
  let suffix = 2;
  while (existing.includes(slug)) {
    slug = `${rawSlug}-${suffix}`;
    suffix += 1;
  }

  const today = new Date().toISOString().slice(0, 10);

  const created = await client.create({
    _type: "project",
    title,
    slug: { _type: "slug", current: slug },
    status: "draft",
    created_at: today,
    sections: [],
    freeObjects: [],
  });

  return {
    _id: created._id,
    title: created.title as string,
    slug: created.slug as { _type: "slug"; current: string },
    status: "draft",
  };
}

export async function deleteProject(projectId: string): Promise<void> {
  const client = getWriteClient();
  await client.delete({ query: `*[_id == $id && _type == "project"]`, params: { id: projectId } });
}

export interface HomePageItemUpdate {
  id: string;
  isSelectedOnHome: boolean;
  homeOrder: number;
}

/**
 * Payload accepted by the site-settings save endpoint. All fields are optional —
 * only the keys present on the payload are written, leaving other fields alone.
 * This lets the About/Contact editors each patch their own subset of fields
 * without overwriting data they don't control.
 */
export interface SaveSiteSettingsPayload {
  name?: string;
  bio?: string;
  logo?: SanityImage | null;
  contact_email?: string;
  contact_phone?: string;
  social_links?: SocialLink[];
  cv?: {
    url?: string;
    // When present, points at an uploaded file asset (PDF). Sanity dereferences
    // this to a URL at read time.
    file?: { _type: "file"; asset: { _type: "reference"; _ref: string } } | null;
  };
  copyright?: string;
}

const SITE_SETTINGS_DOC_ID = "siteSettings";

export async function saveSiteSettings(payload: SaveSiteSettingsPayload): Promise<SiteSettings> {
  const client = getWriteClient();

  // Normalise any expanded image assets to plain references before writing
  const cleaned = stripExpandedAssets(payload) as SaveSiteSettingsPayload;

  // Build the patch — only set keys that are actually present so partial
  // updates from the About / Contact editors don't clobber other fields.
  const set: Record<string, unknown> = {};
  const unset: string[] = [];
  for (const key of Object.keys(cleaned) as (keyof SaveSiteSettingsPayload)[]) {
    const value = cleaned[key];
    if (value === undefined) continue;
    if (value === null) {
      unset.push(key);
    } else {
      set[key] = value;
    }
  }

  // Try to patch the singleton siteSettings document. If it doesn't exist yet,
  // create it. `createIfNotExists` ensures first-run works without a pre-seed.
  await client.createIfNotExists({ _id: SITE_SETTINGS_DOC_ID, _type: "siteSettings" });

  let patch = client.patch(SITE_SETTINGS_DOC_ID);
  if (Object.keys(set).length > 0) patch = patch.set(set);
  if (unset.length > 0) patch = patch.unset(unset);
  const updated = await patch.commit<SiteSettings>();
  return updated;
}

export async function updateHomePageOrder(items: HomePageItemUpdate[]): Promise<void> {
  if (!items.length) return;
  const client = getWriteClient();
  const tx = items.reduce(
    (acc, item) =>
      acc.patch(item.id, (p) =>
        p.set({ isSelectedOnHome: item.isSelectedOnHome, homeOrder: item.homeOrder }),
      ),
    client.transaction(),
  );
  await tx.commit();
}
