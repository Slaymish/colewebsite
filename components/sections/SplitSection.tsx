import Image from "next/image";
import type { SplitSection, BlockContent } from "../../types";
import { urlFor } from "../../lib/sanity";

interface SplitSectionProps {
  section: SplitSection;
}

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

export default function SplitSectionComponent({ section }: SplitSectionProps) {
  if (!section.image?.asset) return null;

  const imageAspectRatio = section.imageAspectRatio ?? "4/3";
  const verticalAlign = section.verticalAlign ?? "center";
  const gap = section.gap ?? 24;
  const objectFit = (section.objectFit as "cover" | "contain") ?? "cover";
  const borderRadius = section.borderRadius ?? 2;

  const imageUrl = urlFor(section.image)
    .width(800)
    .height(600)
    .auto("format")
    .url();
  const thumbUrl = urlFor(section.image).width(40).blur(10).url();
  const imageLeft = section.imagePosition !== "right";

  const imageEl = (
    <div className="space-y-2">
      <div
        className="overflow-hidden rounded-2xl bg-neutral-100"
        style={{ aspectRatio: imageAspectRatio, borderRadius }}
      >
        <Image
          src={imageUrl}
          alt={section.image.alt ?? ""}
          width={800}
          height={600}
          className="h-full w-full"
          style={{ objectFit }}
          placeholder={thumbUrl ? "blur" : "empty"}
          blurDataURL={thumbUrl}
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
      {section.caption && (
        <p className="mt-1 text-xs text-neutral-400">{section.caption}</p>
      )}
    </div>
  );

  const textEl = (
    <div
      className="flex flex-col gap-4 text-base"
      style={{ justifyContent: verticalAlign }}
    >
      {section.content ? renderContent(section.content) : null}
    </div>
  );

  const alignClass: Record<string, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };

  return (
    <section className="py-3">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${alignClass[verticalAlign] ?? "items-center"}`}
        style={{ gap }}
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
