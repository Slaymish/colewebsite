import Image from "next/image";
import type { ImageSection } from "../../types";
import { urlFor } from "../../lib/sanity";

interface ImageSectionProps {
  section: ImageSection;
}

/**
 * This is used to display a single image.
 * It can be configured to be full width or not.
 * @param param0
 * @returns
 */
export default function ImageSectionComponent({ section }: ImageSectionProps) {
  if (!section.image) return null;

  const imageUrl = urlFor(section.image).width(1400).auto("format").url();
  const thumbUrl = urlFor(section.image).width(40).blur(10).url();

  return (
    <section className={`py-6 ${section.fullWidth ? "" : "px-8"}`}>
      <figure>
        <div
          className={`overflow-hidden ${
            section.fullWidth ? "" : "rounded-sm"
          } bg-neutral-100`}
          style={{ aspectRatio: "16/10" }}
        >
          <Image
            src={imageUrl}
            alt={section.image.alt ?? ""}
            width={1400}
            height={875}
            className="h-full w-full object-cover"
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
