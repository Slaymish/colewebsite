export function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

interface VimeoEmbedOptions {
  autoplay?: boolean;
  loop?: boolean;
}

export function buildVimeoEmbedUrl(
  videoId: string,
  options: VimeoEmbedOptions = {},
): string {
  const params = new URLSearchParams({
    autoplay: options.autoplay ? "1" : "0",
    muted: "1",
    loop: options.loop ? "1" : "0",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });
  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}
