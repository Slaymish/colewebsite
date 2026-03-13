"use client";

import type { FreeVideoObject } from "../../types";

interface FreeVideoObjectProps {
  obj: FreeVideoObject;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export default function FreeVideoObjectComponent({
  obj,
}: FreeVideoObjectProps) {
  if (!obj.vimeoUrl) return null;

  const videoId = getVimeoId(obj.vimeoUrl);
  if (!videoId) return null;

  const x = obj.xPercent ?? 10;
  const y = obj.yPercent ?? 10;
  const width = obj.widthPercent ?? 40;
  const zIndex = obj.zIndex ?? 10;
  const rotation = obj.rotation ?? 0;
  const opacity = obj.opacity ?? 1;
  const aspectRatio = obj.aspectRatio ?? "16/9";
  const borderRadius = obj.borderRadius ?? 0;

  const params = new URLSearchParams({
    autoplay: obj.autoplay ? "1" : "0",
    muted: "1",
    loop: obj.loop ? "1" : "0",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });

  const embedUrl = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        zIndex,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        opacity,
      }}
    >
      <div
        className="overflow-hidden bg-neutral-900"
        style={{ aspectRatio, borderRadius }}
      >
        <iframe
          src={embedUrl}
          title="Video"
          className="h-full w-full"
          width="100%"
          height="100%"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
