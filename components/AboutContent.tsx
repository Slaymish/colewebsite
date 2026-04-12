import type { SiteSettings } from "../types";
import Image from "next/image";
import { urlFor } from "../lib/sanity";

interface AboutContentProps {
  settings: SiteSettings | null;
}

export default function AboutContent({ settings }: AboutContentProps) {
  const name = settings?.name ?? "Cole Anderson";
  const bio =
    settings?.bio ??
    "Designer and creative. Add a bio in Site Settings in Sanity.";

  const portraitUrl =
    settings?.logo?.asset && "_id" in settings.logo.asset
      ? urlFor(settings.logo).width(640).height(640).auto("format").url()
      : null;

  const portraitThumb =
    settings?.logo?.asset && "_id" in settings.logo.asset
      ? urlFor(settings.logo).width(40).blur(10).url()
      : null;

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Portrait + name */}
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
        {portraitUrl ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-black/10 bg-black/5">
            <Image
              src={portraitUrl}
              alt={settings?.logo?.alt ?? name}
              width={320}
              height={320}
              className="h-full w-full object-cover"
              placeholder={portraitThumb ? "blur" : "empty"}
              blurDataURL={portraitThumb ?? undefined}
              priority
            />
          </div>
        ) : (
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-2xl font-semibold tracking-tight text-neutral-800"
            aria-hidden
          >
            {initials || "—"}
          </div>
        )}
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-900 sm:text-4xl">
          {name}
        </h1>
      </div>

      {/* Bio */}
      <div className="mt-8 space-y-4 text-[1rem] leading-[1.7] text-black/70">
        <p>{bio}</p>
      </div>
    </>
  );
}
