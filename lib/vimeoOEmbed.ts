/**
 * Fetches Vimeo oEmbed metadata so embed containers can match the video’s real aspect ratio.
 */
export async function fetchVimeoAspectRatio(
  vimeoUrl: string,
): Promise<string | null> {
  try {
    const u = new URL("https://vimeo.com/api/oembed.json");
    u.searchParams.set("url", vimeoUrl);
    const res = await fetch(u.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as { width?: number; height?: number };
    if (data.width && data.height) return `${data.width}/${data.height}`;
  } catch {
    /* ignore */
  }
  return null;
}
