import type { ImageSection } from "../../types";
import { urlFor } from "../../lib/sanity";
import ExpandableImage from "../ExpandableImage";

interface ImageSectionProps {
  section: ImageSection;
}

export default function ImageSectionComponent({ section }: ImageSectionProps) {
  if (!section.image?.asset) return null;

  const aspectRatio = section.aspectRatio ?? "16/10";
  const objectFit =
    (section.objectFit as "cover" | "contain" | "fill") ?? "cover";
  const borderRadius = section.borderRadius ?? 2;
  const grayscale = section.grayscale ?? false;
  const opacity = section.opacity ?? 1;
  const rotation = section.rotation ?? 0;
  // Scale up to ensure the image covers the rounded corners when rotated
  const scale = rotation !== 0
    ? 1 / Math.cos(Math.abs(rotation) * Math.PI / 180)
    : 1;

  const imageUrl = urlFor(section.image).width(1400).auto("format").url();
  const thumbUrl = urlFor(section.image).width(40).blur(10).url();

  return (
    <section className="py-3">
      <figure>
        <div
          className="overflow-hidden rounded-2xl bg-neutral-100"
          style={{
            aspectRatio,
            borderRadius,
          }}
        >
          <ExpandableImage
            src={imageUrl}
            alt={section.image.alt ?? ""}
            width={1400}
            height={875}
            className="h-full w-full"
            style={{
              objectFit,
              filter: grayscale ? "grayscale(1)" : undefined,
              opacity,
              transform: rotation !== 0 ? `rotate(${rotation}deg) scale(${scale.toFixed(4)})` : undefined,
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
          <figcaption className="mt-2 text-xs text-neutral-400">
            {section.caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
