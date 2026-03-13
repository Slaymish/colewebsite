import Image from "next/image";
import type { FreeImageObject } from "../../types";
import { urlFor } from "../../lib/sanity";

interface FreeImageObjectProps {
  obj: FreeImageObject;
}

export default function FreeImageObjectComponent({
  obj,
}: FreeImageObjectProps) {
  if (!obj.image?.asset) return null;

  const x = obj.xPercent ?? 10;
  const y = obj.yPercent ?? 10;
  const width = obj.widthPercent ?? 40;
  const zIndex = obj.zIndex ?? 10;
  const rotation = obj.rotation ?? 0;
  const opacity = obj.opacity ?? 1;
  const borderRadius = obj.borderRadius ?? 0;
  const grayscale = obj.grayscale ?? false;

  const imageUrl = urlFor(obj.image).width(1400).auto("format").url();
  const thumbUrl = urlFor(obj.image).width(40).blur(10).url();

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
        pointerEvents: "none",
      }}
    >
      <Image
        src={imageUrl}
        alt={obj.image.alt ?? ""}
        width={1400}
        height={875}
        className="block h-auto w-full"
        style={{
          borderRadius,
          filter: grayscale ? "grayscale(1)" : undefined,
        }}
        placeholder={thumbUrl ? "blur" : "empty"}
        blurDataURL={thumbUrl}
        sizes="100vw"
        loading="lazy"
      />
    </div>
  );
}
