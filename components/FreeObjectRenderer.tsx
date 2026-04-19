import Image from "next/image";
import type { FreeObject, FreeImageObject, FreeVideoObject, FreeTextObject } from "../types";
import { urlFor } from "../lib/sanity";
import { renderBlock } from "../lib/renderBlock";
import { getVimeoId, buildVimeoEmbedUrl } from "../lib/vimeo";
import FreeImageObjectComponent from "./sections/FreeImageObject";
import FreeVideoObjectComponent from "./sections/FreeVideoObject";
import FreeTextObjectComponent from "./sections/FreeTextObject";

interface FreeObjectRendererProps {
  freeObjects: FreeObject[];
}

// --- Mobile fallback renderers (flow layout, no absolute positioning) ---

function MobileImageFallback({ obj }: { obj: FreeImageObject }) {
  if (!obj.image?.asset) return null;
  const imageUrl = urlFor(obj.image).width(900).auto("format").url();
  const thumbUrl = urlFor(obj.image).width(40).blur(10).url();
  return (
    <Image
      src={imageUrl}
      alt={obj.image.alt ?? ""}
      width={900}
      height={562}
      className="block h-auto w-full"
      style={{
        borderRadius: obj.borderRadius ?? 0,
        filter: obj.grayscale ? "grayscale(1)" : undefined,
        opacity: obj.opacity ?? 1,
      }}
      placeholder={thumbUrl ? "blur" : "empty"}
      blurDataURL={thumbUrl}
      sizes="100vw"
      loading="lazy"
    />
  );
}

function MobileVideoFallback({ obj }: { obj: FreeVideoObject }) {
  const aspect = obj.aspectRatio ?? "16/9";
  const nativeUrl = obj.videoFile?.asset?.url ?? null;

  if (nativeUrl) {
    return (
      <div
        className="overflow-hidden bg-neutral-900"
        style={{ aspectRatio: aspect, borderRadius: obj.borderRadius ?? 0 }}
      >
        <video
          src={nativeUrl}
          autoPlay={obj.autoplay}
          muted
          playsInline
          loop={obj.loop}
          preload={obj.autoplay ? "auto" : "metadata"}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (!obj.vimeoUrl) return null;
  const videoId = getVimeoId(obj.vimeoUrl);
  if (!videoId) return null;

  const embedUrl = buildVimeoEmbedUrl(videoId, {
    autoplay: false,
    loop: obj.loop,
  });

  return (
    <div
      className="overflow-hidden bg-neutral-900"
      style={{ aspectRatio: aspect, borderRadius: obj.borderRadius ?? 0 }}
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
  );
}

function MobileTextFallback({ obj }: { obj: FreeTextObject }) {
  if (!obj.content?.length) return null;
  const fontSizeMap: Record<string, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };
  const fontSize = fontSizeMap[obj.fontSize ?? "base"] ?? "text-base";
  return (
    <div
      className={`${fontSize} space-y-2`}
      style={{
        color: obj.color ?? "#171717",
        textAlign: obj.textAlign ?? "left",
        opacity: obj.opacity ?? 1,
      }}
    >
      {obj.content.map((block) => renderBlock(block, { variant: "compact" }))}
    </div>
  );
}

export default function FreeObjectRenderer({ freeObjects }: FreeObjectRendererProps) {
  // Sort by yPercent for natural reading order on mobile
  const sorted = [...freeObjects].sort((a, b) => (a.yPercent ?? 10) - (b.yPercent ?? 10));

  return (
    <>
      {/* Mobile: stacked fallbacks (no absolute positioning) */}
      <div className="flex flex-col gap-6 md:hidden">
        {sorted.map((obj) => {
          switch (obj._type) {
            case "freeImageObject":
              return <MobileImageFallback key={obj._key} obj={obj as FreeImageObject} />;
            case "freeVideoObject":
              return <MobileVideoFallback key={obj._key} obj={obj as FreeVideoObject} />;
            case "freeTextObject":
              return <MobileTextFallback key={obj._key} obj={obj as FreeTextObject} />;
            default:
              return null;
          }
        })}
      </div>

      {/* Desktop: absolute layout */}
      <div className="hidden md:block">
        {freeObjects.map((obj) => {
          switch (obj._type) {
            case "freeImageObject":
              return <FreeImageObjectComponent key={obj._key} obj={obj} />;
            case "freeVideoObject":
              return <FreeVideoObjectComponent key={obj._key} obj={obj} />;
            case "freeTextObject":
              return <FreeTextObjectComponent key={obj._key} obj={obj} />;
            default:
              return null;
          }
        })}
      </div>
    </>
  );
}
