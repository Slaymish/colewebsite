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
