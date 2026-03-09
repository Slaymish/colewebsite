"use client";

import type { VideoSection } from "../../types";

interface VideoSectionProps {
  section: VideoSection;
}

/**
 * This is used to get the Vimeo ID from a Vimeo URL.
 * @param url The Vimeo URL
 * @returns The Vimeo ID
 */
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * This is used to display a video section.
 * @param param0
 * @returns
 */
export default function VideoSectionComponent({ section }: VideoSectionProps) {
  if (!section.vimeoUrl) return null;

  const videoId = getVimeoId(section.vimeoUrl);
  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: "0",
    muted: "1",
    loop: section.loop ? "1" : "0",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });

  const embedUrl = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;

  return (
    <section className="px-8 py-6">
      <figure>
        <div className="overflow-hidden rounded-sm bg-neutral-900 aspect-video">
          <iframe
            src={embedUrl}
            title={section.caption ?? "Video"}
            className="h-full w-full"
            width="100%"
            height="100%"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        {section.caption && (
          <figcaption className="mt-2 text-xs text-neutral-400">
            {section.caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
