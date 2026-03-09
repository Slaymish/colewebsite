import Image from "next/image";
import type { SplitSection, BlockContent } from "../../types";
import { urlFor } from "../../lib/sanity";

interface SplitSectionProps {
  section: SplitSection;
}

/**
 * This is used to render the content of a split section.
 * @param content The content to render
 * @returns The rendered content
 */
function renderContent(content: BlockContent[]) {
  return content.map((block) => {
    const text = block.children.map((child) => child.text).join("");
    switch (block.style) {
      case "h3":
        return (
          <h3 key={block._key} className="text-lg font-medium">
            {text}
          </h3>
        );
      default:
        return (
          <p key={block._key} className="leading-relaxed text-neutral-700">
            {text}
          </p>
        );
    }
  });
}

/**
 * This is used to display a split section with an image and text.
 * The image can be on the left or right.
 * @param param0
 * @returns
 */
export default function SplitSectionComponent({ section }: SplitSectionProps) {
  if (!section.image) return null;

  const imageUrl = urlFor(section.image)
    .width(800)
    .height(600)
    .auto("format")
    .url();
  const thumbUrl = urlFor(section.image).width(40).blur(10).url();
  const imageLeft = section.imagePosition !== "right";

  const imageEl = (
    <div className="overflow-hidden rounded-sm bg-neutral-100 aspect-[4/3]">
      <Image
        src={imageUrl}
        alt={section.image.alt ?? ""}
        width={800}
        height={600}
        className="h-full w-full object-cover"
        placeholder={thumbUrl ? "blur" : "empty"}
        blurDataURL={thumbUrl}
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
      />
      {section.caption && (
        <p className="mt-1 text-xs text-neutral-400">{section.caption}</p>
      )}
    </div>
  );

  const textEl = (
    <div className="flex flex-col justify-center gap-4 text-base">
      {section.content ? renderContent(section.content) : null}
    </div>
  );

  return (
    <section className="px-8 py-6">
      <div
        className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
          imageLeft ? "" : "md:[&>*:first-child]:order-last"
        }`}
      >
        {imageLeft ? (
          <>
            {imageEl}
            {textEl}
          </>
        ) : (
          <>
            {textEl}
            {imageEl}
          </>
        )}
      </div>
    </section>
  );
}
