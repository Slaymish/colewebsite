/**
 * Fetches Vimeo oEmbed metadata so embed containers can match the video's real aspect ratio.
 * Results are cached in-memory and in localStorage to avoid repeated network requests.
 */

const memCache = new Map<string, string>();
const LS_PREFIX = "vimeo-aspect:";

export async function fetchVimeoAspectRatio(
  vimeoUrl: string,
): Promise<string | null> {
  // 1. In-memory cache
  if (memCache.has(vimeoUrl)) return memCache.get(vimeoUrl)!;

  // 2. localStorage cache (client-side only)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LS_PREFIX + vimeoUrl);
    if (stored) {
      memCache.set(vimeoUrl, stored);
      return stored;
    }
  }

  // 3. Network fetch
  try {
    const u = new URL("https://vimeo.com/api/oembed.json");
    u.searchParams.set("url", vimeoUrl);
    const res = await fetch(u.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as { width?: number; height?: number };
    if (data.width && data.height) {
      const aspect = `${data.width}/${data.height}`;
      memCache.set(vimeoUrl, aspect);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LS_PREFIX + vimeoUrl, aspect);
        } catch {
          // localStorage quota exceeded — ignore
        }
      }
      return aspect;
    }
  } catch {
    /* ignore */
  }
  return null;
}
