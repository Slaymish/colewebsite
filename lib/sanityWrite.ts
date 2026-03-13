import { createClient } from "next-sanity";
import type { Section, FreeObject } from "../types";

export function getWriteClient() {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_API_TOKEN is not set. Add it to your .env.local file.",
    );
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
    if (
      key === "asset" &&
      obj[key] &&
      typeof obj[key] === "object" &&
      "_ref" in (obj[key] as object)
    ) {
      // Keep only the reference fields — discard _id, url, metadata, etc.
      const ref = obj[key] as Record<string, unknown>;
      result[key] = { _type: ref._type ?? "reference", _ref: ref._ref };
    } else {
      result[key] = stripExpandedAssets(obj[key]);
    }
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
}

export async function saveProject(payload: SaveProjectPayload): Promise<void> {
  const client = getWriteClient();

  // Strip expanded asset data before writing — Sanity only accepts plain references
  const cleanSections = stripExpandedAssets(payload.sections) as Section[];

  const cleanFreeObjects = stripExpandedAssets(
    payload.freeObjects ?? [],
  ) as FreeObject[];

  const patch: Record<string, unknown> = {
    sections: cleanSections,
    freeObjects: cleanFreeObjects,
  };

  if (payload.status !== undefined) patch.status = payload.status;
  if (payload.title !== undefined) patch.title = payload.title;
  if (payload.meta_description !== undefined)
    patch.meta_description = payload.meta_description;
  if (payload.category !== undefined) patch.category = payload.category || null;
  if (payload.tags !== undefined) patch.tags = payload.tags;

  await client.patch(payload.projectId).set(patch).commit();
}
