import Image from "next/image";
import type { HeroSection } from "../../types";
import { urlFor } from "../../lib/sanity";

interface HeroSectionProps {
  section: HeroSection;
}

/**
 * This is used to display a hero section with a background image.
 * It can be used to display a heading and subheading.
 * @param param0
 * @returns
 */
export default function HeroSectionComponent({ section }: HeroSectionProps) {
  const bgUrl = section.backgroundImage
    ? urlFor(section.backgroundImage)
        .width(1600)
        .height(900)
        .auto("format")
        .url()
    : null;

  return (
    <section
      className={`relative flex min-h-[60vh] items-end p-8 ${
        bgUrl ? "text-white" : "bg-neutral-100 text-neutral-900"
      }`}
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
      {bgUrl && <div className="absolute inset-0 bg-black/30" />}
      <div className="relative z-10 max-w-2xl">
        {section.heading && (
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
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
