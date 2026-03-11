import Image from "next/image";
import type { ImageSection } from "../../types";
import { urlFor } from "../../lib/sanity";

interface ImageSectionProps {
  section: ImageSection;
}

export default function ImageSectionComponent({ section }: ImageSectionProps) {
  if (!section.image?.asset?._ref) return null;

  const aspectRatio = section.aspectRatio ?? "16/10";
  const objectFit =
    (section.objectFit as "cover" | "contain" | "fill") ?? "cover";
  const borderRadius = section.borderRadius ?? 2;
  const grayscale = section.grayscale ?? false;
  const opacity = section.opacity ?? 1;
  const isFree = section.positionMode === "free";

  const imageUrl = urlFor(section.image).width(1400).auto("format").url();
  const thumbUrl = urlFor(section.image).width(40).blur(10).url();

  if (isFree) {
    const sectionHeight = section.sectionHeight ?? 500;
    const x = section.xPercent ?? 0;
    const y = section.yPercent ?? 0;
    const width = section.widthPercent ?? 100;
    const zIndex = section.zIndex ?? 0;
    const rotation = section.rotation ?? 0;

    return (
      <section
        className={section.fullWidth ? "" : "px-8 py-6"}
        style={{
          position: "relative",
          minHeight: sectionHeight,
          overflow: "hidden",
        }}
      >
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
          <Image
            src={imageUrl}
            alt={section.image.alt ?? ""}
            width={1400}
            height={875}
            className="w-full h-auto block"
            style={{
              objectFit,
              filter: grayscale ? "grayscale(1)" : undefined,
              borderRadius,
            }}
            placeholder={thumbUrl ? "blur" : "empty"}
            blurDataURL={thumbUrl}
            sizes="100vw"
            loading="lazy"
          />
        </div>
        {section.caption && (
          <figcaption
            className="absolute bottom-2 px-8 text-xs text-neutral-400"
            style={{ zIndex: zIndex + 1 }}
          >
            {section.caption}
          </figcaption>
        )}
      </section>
    );
  }

  return (
    <section className={`py-6 ${section.fullWidth ? "" : "px-8"}`}>
      <figure>
        <div
          className="overflow-hidden bg-neutral-100"
          style={{
            aspectRatio,
            borderRadius,
          }}
        >
          <Image
            src={imageUrl}
            alt={section.image.alt ?? ""}
            width={1400}
            height={875}
            className="h-full w-full"
            style={{
              objectFit,
              filter: grayscale ? "grayscale(1)" : undefined,
              opacity,
            }}
            placeholder={thumbUrl ? "blur" : "empty"}
            blurDataURL={thumbUrl}
            sizes={
              section.fullWidth ? "100vw" : "(max-width: 768px) 100vw, 900px"
            }
            loading="lazy"
          />
        </div>
        {section.caption && (
          <figcaption className="mt-2 px-8 text-xs text-neutral-400">
            {section.caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
