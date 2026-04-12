import type { Metadata } from "next";
import Image from "next/image";
import BackToTopButton from "../../components/BackToTopButton";
import Header from "../../components/Header";
import { getAllPublishedProjects, getSiteSettings } from "../../lib/queries";
import { urlFor } from "../../lib/sanity";

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description: "About Cole Anderson — portfolio and creative work.",
  };
}

export default async function AboutPage() {
  const [projects, settings] = await Promise.all([
    getAllPublishedProjects(),
    getSiteSettings(),
  ]);

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
    <div className="min-h-screen md:grid md:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)]">
      <Header settings={settings} projects={projects} currentPage="about" />

      <main id="main-content" className="min-w-0 md:flex" aria-label="About">
        <div className="relative w-full max-w-[1040px] px-5 py-6 pb-16 md:px-10 md:py-8 md:pb-20 xl:px-12">
          <div className="flex flex-col gap-8">
            <h1 className="text-base font-medium leading-[1.45]">About</h1>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
              {portraitUrl ? (
                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border border-black/10 bg-black/5">
                  <Image
                    src={portraitUrl}
                    alt={settings?.logo?.alt ?? name}
                    width={320}
                    height={320}
                    className="h-full w-full object-cover"
                    placeholder={portraitThumb ? "blur" : "empty"}
                    blurDataURL={portraitThumb ?? undefined}
                  />
                </div>
              ) : (
                <div
                  className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-3xl font-semibold tracking-tight text-neutral-800"
                  aria-hidden
                >
                  {initials || "—"}
                </div>
              )}
              <div className="max-w-[34rem] space-y-4 text-[0.96rem] leading-[1.6] text-black/70">
                <p>{bio}</p>
                {settings?.contact_email && (
                  <p>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="text-black/80 underline decoration-black/25 underline-offset-2 transition hover:decoration-black/50"
                    >
                      {settings.contact_email}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
          <BackToTopButton />
        </div>
      </main>
    </div>
  );
}
