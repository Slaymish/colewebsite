import type { GallerySection } from "../../types";
import { urlFor } from "../../lib/sanity";
import ExpandableImage from "../ExpandableImage";

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

  const validImages = section.images.filter((image) => image.asset);
  const galleryImages = validImages.map((image) => ({
    src: urlFor(image).width(900).height(600).auto("format").url(),
    alt: image.alt ?? "",
    width: 900,
    height: 600,
  }));

  return (
    <section className="px-8 py-6">
      <div
        className={`grid ${gridClass}`}
        style={{ gap }}
        role="list"
        aria-label="Image gallery"
      >
        {validImages.map((image, galleryIndex) => {
          const src = galleryImages[galleryIndex].src;
          const thumb = urlFor(image).width(40).blur(10).url();

          const imageAspectRatio = image.aspectRatio || aspectRatio;

        return (
            <figure key={image._key} role="listitem">
              <div
                className="overflow-hidden bg-black/[0.03]"
                style={{ aspectRatio: imageAspectRatio, borderRadius }}
              >
                <ExpandableImage
                  src={src}
                  alt={image.alt ?? ""}
                  width={900}
                  height={600}
                  className="h-full w-full"
                  style={{ objectFit }}
                  placeholder={thumb ? "blur" : "empty"}
                  blurDataURL={thumb}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                  galleryImages={galleryImages}
                  galleryIndex={galleryIndex}
                />
              </div>
              {image.caption && (
                <figcaption className="mt-1 text-xs text-black/40">
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
