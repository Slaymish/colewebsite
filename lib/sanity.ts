import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export function isSanityConfigured(): boolean {
  return Boolean(projectId);
}

let _client: SanityClient | null = null;

export function getClient(): SanityClient {
  if (!_client) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production",
    });
  }
  return _client;
}

export function urlFor(source: unknown) {
  return imageUrlBuilder(getClient()).image(source as never);
}

/**
 * Narrows an asset field to a resolved Sanity asset (has `_id` + `url`)
 * as opposed to an unresolved reference stub (has only `_ref`).
 */
export function isResolvedAsset(
  asset: unknown,
): asset is { _id: string; url: string; metadata?: unknown } {
  return (
    Boolean(asset) &&
    typeof asset === "object" &&
    "_id" in (asset as object)
  );
}
