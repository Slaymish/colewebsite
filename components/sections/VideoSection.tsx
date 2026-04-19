"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { VideoSection } from "../../types";
import { urlFor } from "../../lib/sanity";
import { fetchVimeoAspectRatio } from "../../lib/vimeoOEmbed";
import { getVimeoId, buildVimeoEmbedUrl } from "../../lib/vimeo";

interface VideoSectionProps {
  section: VideoSection;
}

export default function VideoSectionComponent({ section }: VideoSectionProps) {
  const [vimeoLoaded, setVimeoLoaded] = useState(false);
  const [nativeAspect, setNativeAspect] = useState<string | null>(null);
  const [vimeoAspect, setVimeoAspect] = useState<string | null>(null);

  const aspectFallback = section.aspectRatio ?? "16/9";
  const borderRadius = section.borderRadius ?? 2;

  const nativeUrl = section.videoFile?.asset?.url ?? null;

  useEffect(() => {
    setNativeAspect(null);
    setVimeoAspect(null);
    setVimeoLoaded(false);
  }, [section._key, nativeUrl, section.vimeoUrl]);

  useEffect(() => {
    if (nativeUrl || !section.vimeoUrl) return;
    let cancelled = false;
    fetchVimeoAspectRatio(section.vimeoUrl).then((a) => {
      if (!cancelled && a) setVimeoAspect(a);
    });
    return () => {
      cancelled = true;
    };
  }, [nativeUrl, section.vimeoUrl]);

  const displayAspect = nativeAspect ?? vimeoAspect ?? aspectFallback;

  // --- Native video (uploaded file) ---
  if (nativeUrl) {
    const posterUrl =
      section.poster?.asset && "_id" in section.poster.asset
        ? urlFor(section.poster).width(1400).auto("format").url()
        : null;

    return (
      <section className="px-5 py-4 md:px-8 md:py-6">
        <figure>
          <div
            className="overflow-hidden bg-black"
            style={{ aspectRatio: displayAspect, borderRadius }}
          >
            <video
              src={nativeUrl}
              poster={posterUrl ?? undefined}
              controls
              playsInline
              loop={section.loop}
              preload="metadata"
              className="h-full w-full object-contain"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) {
                  setNativeAspect(`${v.videoWidth}/${v.videoHeight}`);
                }
              }}
            />
          </div>
          {section.caption && (
            <figcaption className="mt-2 text-xs text-black/40">{section.caption}</figcaption>
          )}
        </figure>
      </section>
    );
  }

  // --- Vimeo embed (facade pattern) ---
  if (!section.vimeoUrl) return null;
  const videoId = getVimeoId(section.vimeoUrl);
  if (!videoId) return null;

  const embedUrl = buildVimeoEmbedUrl(videoId, {
    autoplay: section.autoplay,
    loop: section.loop,
  });

  const posterUrl =
    section.poster?.asset && "_id" in section.poster.asset
      ? urlFor(section.poster).width(1400).auto("format").url()
      : null;

  const posterLqip =
    section.poster?.asset && "_id" in section.poster.asset
      ? ((section.poster.asset as { metadata?: { lqip?: string } }).metadata?.lqip ?? null)
      : null;

  return (
    <section className="px-5 py-4 md:px-8 md:py-6">
      <figure>
        <div
          className="relative overflow-hidden bg-black"
          style={{ aspectRatio: displayAspect, borderRadius }}
        >
          {vimeoLoaded ? (
            <iframe
              src={embedUrl}
              title={section.caption ?? "Video"}
              className="h-full w-full"
              width="100%"
              height="100%"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="group relative h-full w-full cursor-pointer"
              onClick={() => setVimeoLoaded(true)}
              aria-label="Play video"
            >
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={section.poster?.alt ?? section.caption ?? "Video thumbnail"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 899px) 100vw, min(1040px, 78vw)"
                  placeholder={posterLqip ? "blur" : "empty"}
                  blurDataURL={posterLqip ?? undefined}
                />
              ) : (
                <div className="h-full w-full bg-black" />
              )}
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center bg-white/20 hover:bg-white/30">
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="h-7 w-7 translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>
        {section.caption && (
          <figcaption className="mt-2 text-xs text-black/40">{section.caption}</figcaption>
        )}
      </figure>
    </section>
  );
}
