"use client";

import { useEffect, useState } from "react";
import type { FreeVideoObject } from "../../types";
import { fetchVimeoAspectRatio } from "../../lib/vimeoOEmbed";
import { getVimeoId, buildVimeoEmbedUrl } from "../../lib/vimeo";

interface FreeVideoObjectProps {
  obj: FreeVideoObject;
}

export default function FreeVideoObjectComponent({ obj }: FreeVideoObjectProps) {
  const x = obj.xPercent ?? 10;
  const y = obj.yPercent ?? 10;
  const width = obj.widthPercent ?? 40;
  const zIndex = obj.zIndex ?? 10;
  const rotation = obj.rotation ?? 0;
  const opacity = obj.opacity ?? 1;
  const fallbackAspect = obj.aspectRatio ?? "16/9";
  const borderRadius = obj.borderRadius ?? 0;

  const nativeUrl = obj.videoFile?.asset?.url ?? null;
  const [resolvedAspect, setResolvedAspect] = useState<string | null>(null);

  useEffect(() => {
    setResolvedAspect(null);
  }, [obj._key, nativeUrl, obj.vimeoUrl]);

  useEffect(() => {
    if (nativeUrl || !obj.vimeoUrl) return;
    let cancelled = false;
    fetchVimeoAspectRatio(obj.vimeoUrl).then((a) => {
      if (!cancelled && a) setResolvedAspect(a);
    });
    return () => {
      cancelled = true;
    };
  }, [nativeUrl, obj.vimeoUrl]);

  const aspectStyle = resolvedAspect ?? fallbackAspect;

  const containerStyle = {
    position: "absolute" as const,
    left: `${x}%`,
    top: `${y}%`,
    width: `${width}%`,
    zIndex,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    opacity,
  };

  if (nativeUrl) {
    return (
      <div style={containerStyle}>
        <div
          className="overflow-hidden bg-black"
          style={{ aspectRatio: aspectStyle, borderRadius }}
        >
          <video
            src={nativeUrl}
            autoPlay={obj.autoplay}
            muted
            playsInline
            loop={obj.loop}
            preload={obj.autoplay ? "auto" : "metadata"}
            className="h-full w-full object-contain"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth && v.videoHeight) {
                setResolvedAspect(`${v.videoWidth}/${v.videoHeight}`);
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (!obj.vimeoUrl) return null;
  const videoId = getVimeoId(obj.vimeoUrl);
  if (!videoId) return null;

  const embedUrl = buildVimeoEmbedUrl(videoId, {
    autoplay: obj.autoplay,
    loop: obj.loop,
  });

  return (
    <div style={containerStyle}>
      <div
        className="overflow-hidden bg-neutral-900"
        style={{ aspectRatio: aspectStyle, borderRadius }}
      >
        <iframe
          src={embedUrl}
          title="Video"
          className="h-full w-full"
          width="100%"
          height="100%"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          {...(obj.autoplay ? {} : { loading: "lazy" as const })}
        />
      </div>
    </div>
  );
}
