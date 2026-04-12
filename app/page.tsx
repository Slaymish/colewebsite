import AboutContent from "../components/AboutContent";
import ContactContent from "../components/ContactContent";
import Image from "next/image";
import Link from "next/link";
import BackToTopButton from "../components/BackToTopButton";
import Header from "../components/Header";
import { getAllPublishedProjects, getSiteSettings } from "../lib/queries";
import { urlFor } from "../lib/sanity";
import { personJsonLd, websiteJsonLd } from "../lib/structured-data";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const [projects, settings] = await Promise.all([
    getAllPublishedProjects(),
    getSiteSettings(),
  ]);

  const name = settings?.name ?? "Cole Anderson";
  const bio = settings?.bio ?? "Designer and creative.";
  const cvUrl =
    settings?.cv?.url ||
    (settings?.cv?.file as { asset?: { url?: string } })?.asset?.url;

  if (page === "about" || page === "contact") {
    return (
      <div className="min-h-screen bg-white">
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

        <main
          id="main-content"
          className="mx-auto max-w-2xl px-6 py-12 sm:px-10 sm:py-16 md:py-20"
          aria-label={page === "about" ? "About" : "Contact"}
        >
          {page === "about"
            ? <AboutContent settings={settings} />
            : <ContactContent settings={settings} />}
        </main>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            personJsonLd(settings),
            websiteJsonLd(settings),
          ]),
        }}
      />

      <div className="min-h-screen md:grid md:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)]">
        <Header settings={settings} projects={projects} currentPage="home" />

        <main id="main-content" className="min-w-0 md:flex" aria-label="Home">
          <div className="relative w-full max-w-[1040px] px-5 py-6 pb-16 md:px-10 md:py-8 md:pb-20 xl:px-12">
            <div className="flex flex-col gap-6">
              <section aria-labelledby="hero-heading" className="pb-3">
                <h1
                  id="hero-heading"
                  className="text-base font-medium leading-[1.45]"
                >
                  Selected Work
                </h1>
                <p className="mt-2 max-w-[34rem] text-[0.96rem] leading-[1.55] text-black/65">
                  {bio}
                </p>
              </section>

              <section
                className="flex flex-col gap-10"
                aria-label={`${name} projects`}
              >
                {projects.map((project, index) => {
                  const cover = project.cover_image
                    ? urlFor(project.cover_image)
                        .width(1600)
                        .auto("format")
                        .url()
                    : null;

                  const asset = project.cover_image?.asset;
                  const resolvedAsset =
                    asset && "_id" in asset ? asset : null;
                  const blurUrl = resolvedAsset?.metadata?.lqip ?? null;

                  return (
                    <Link
                      key={project._id}
                      href={`/project/${project.slug.current}`}
                      className="flex flex-col gap-3.5"
                    >
                      {cover && (
                        <div className="w-full overflow-hidden rounded-2xl bg-black/5">
                          <Image
                            src={cover}
                            alt={project.cover_image?.alt ?? project.title}
                            width={1600}
                            height={1100}
                            className="h-auto w-full"
                            sizes="(max-width: 899px) 100vw, min(1040px, 78vw)"
                            priority={index === 0}
                            placeholder={blurUrl ? "blur"
                              : "empty"}
                            blurDataURL={blurUrl ?? undefined}
                          />
                        </div>
                      )}
                      <div className="flex items-baseline justify-between gap-4">
                        <h2 className="text-base font-medium leading-[1.35]">
                          {project.title}
                        </h2>
                        {project.created_at && (
                          <span className="whitespace-nowrap text-[0.85rem] text-black/50">
                            {new Date(project.created_at).getFullYear()}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </section>
            </div>
            <BackToTopButton />
          </div>
        </main>
      </div>
    </>
  );
}
