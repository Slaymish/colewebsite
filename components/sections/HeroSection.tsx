import Image from "next/image";
import type { HeroSection } from "../../types";
import { urlFor } from "../../lib/sanity";

interface HeroSectionProps {
  section: HeroSection;
}

export default function HeroSectionComponent({ section }: HeroSectionProps) {
  const bgUrl = section.backgroundImage?.asset
    ? urlFor(section.backgroundImage)
        .width(1600)
        .height(900)
        .auto("format")
        .url()
    : null;

  const minHeight = section.minHeight ?? "60vh";
  const overlayOpacity = section.overlayOpacity ?? 0.3;
  const textAlign = section.textAlign ?? "left";
  const textPosition = section.textPosition ?? "bottom";

  const justifyMap: Record<string, string> = {
    top: "flex-start",
    center: "center",
    bottom: "flex-end",
  };

  const alignMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  return (
    <section
      className={`relative flex p-5 md:p-8 ${
        bgUrl ? "text-white" : "bg-black/[0.03] text-black"
      }`}
      style={{
        minHeight,
        alignItems: justifyMap[textPosition] ?? "flex-end",
        justifyContent: alignMap[textAlign] ?? "flex-start",
      }}
      aria-label="Hero"
    >
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={section.backgroundImage?.alt ?? ""}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      {bgUrl && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div
        className="relative z-10 max-w-2xl"
        style={{ textAlign }}
      >
        {section.heading && (
          <h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-4xl md:text-5xl">
            {section.heading}
          </h2>
        )}
        {section.subheading && (
          <p className="mt-3 text-lg opacity-80">{section.subheading}</p>
        )}
      </div>
    </section>
  );
}
