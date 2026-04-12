import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "../../lib/queries";
import { urlFor } from "../../lib/sanity";

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description: "About Cole Anderson — portfolio and creative work.",
  };
}

// Simple platform → label mapping for social links
const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  twitter: "Twitter / X",
  x: "X",
  linkedin: "LinkedIn",
  vimeo: "Vimeo",
  youtube: "YouTube",
  github: "GitHub",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Website",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

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

  const cvUrl =
    settings?.cv?.url ||
    (settings?.cv?.file as { asset?: { url?: string } })?.asset?.url;

  const socialLinks = settings?.social_links ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal top nav */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10 md:px-14 border-b border-black/8">
        <Link
          href="/"
          className="text-[0.85rem] text-black/50 transition hover:text-black/80"
        >
          ← {name}
        </Link>
        {cvUrl && (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.85rem] text-black/50 transition hover:text-black/80"
          >
            CV / Info
          </a>
        )}
      </nav>

      {/* Main content */}
      <main
        id="main-content"
        className="mx-auto max-w-2xl px-6 py-12 sm:px-10 sm:py-16 md:py-20"
        aria-label="About"
      >
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

        {/* Contact */}
        {settings?.contact_email && (
          <div className="mt-6">
            <a
              href={`mailto:${settings.contact_email}`}
              className="text-[0.95rem] text-black/80 underline decoration-black/25 underline-offset-2 transition hover:decoration-black/60"
            >
              {settings.contact_email}
            </a>
          </div>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link._key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-black/15 px-4 py-1.5 text-[0.82rem] text-black/60 transition hover:border-black/30 hover:text-black/90"
              >
                {link.label ||
                  platformLabels[link.platform?.toLowerCase()] ||
                  link.platform}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
