import Image from "next/image";
import type { GallerySection } from "../../types";
import { urlFor } from "../../lib/sanity";

interface GallerySectionProps {
  section: GallerySection;
}

export default function GallerySectionComponent({
  section,
}: GallerySectionProps) {
  if (!section.images?.length) return null;

  const cols = section.columns ?? 2;
  const gap = section.gap ?? 12;
  const aspectRatio = section.aspectRatio ?? "3/2";
  const borderRadius = section.borderRadius ?? 2;
  const objectFit = (section.objectFit as "cover" | "contain") ?? "cover";

  const gridClass =
    cols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  return (
    <section className="px-8 py-6">
      <div
        className={`grid ${gridClass}`}
        style={{ gap }}
        role="list"
        aria-label="Image gallery"
      >
        {section.images.map((image) => {
          if (!image.asset) return null;
          const src = urlFor(image).width(900).height(600).auto("format").url();
          const thumb = urlFor(image).width(40).blur(10).url();

          return (
            <figure key={image._key} role="listitem">
              <div
                className="overflow-hidden bg-neutral-100"
                style={{ aspectRatio, borderRadius }}
              >
                <Image
                  src={src}
                  alt={image.alt ?? ""}
                  width={900}
                  height={600}
                  className="h-full w-full transition-transform duration-300 hover:scale-[1.02]"
                  style={{ objectFit }}
                  placeholder={thumb ? "blur" : "empty"}
                  blurDataURL={thumb}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              {image.caption && (
                <figcaption className="mt-1 text-xs text-neutral-400">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
