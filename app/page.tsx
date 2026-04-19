import Image from "next/image";
import Link from "next/link";
import BackToTopButton from "../components/BackToTopButton";
import Header from "../components/Header";
import {
  getAllPublishedProjects,
  getSelectedProjectsForHome,
  getSiteSettings,
} from "../lib/queries";
import { urlFor } from "../lib/sanity";
import { personJsonLd, websiteJsonLd } from "../lib/structured-data";

export default async function HomePage() {
  // `allProjects` feeds the sidebar project list; `homeProjects` is the
  // "Selected Work" list in the main column (only those flagged isSelectedOnHome).
  // Falls back to all published projects when none are explicitly selected,
  // so the home page isn't empty before the selection has been configured.
  const [allProjects, homeProjectsRaw, settings] = await Promise.all([
    getAllPublishedProjects(),
    getSelectedProjectsForHome(),
    getSiteSettings(),
  ]);
  const projects = allProjects;
  const homeProjects = homeProjectsRaw.length > 0 ? homeProjectsRaw : allProjects;

  const name = settings?.name ?? "Cole Anderson";
  const bio = settings?.bio ?? "Designer and creative.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd(settings), websiteJsonLd(settings)]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <div className="min-h-screen md:grid md:grid-cols-[minmax(260px,min(22vw,280px))_minmax(0,1fr)]">
        <Header settings={settings} projects={projects} currentPage="home" />

        <main id="main-content" className="min-w-0 md:flex" aria-label="Home">
          <div className="relative w-full max-w-[1040px] px-5 py-6 pb-16 md:px-10 md:py-8 md:pb-20 xl:px-12">
            <div className="flex flex-col gap-6">
              <section aria-labelledby="hero-heading" className="pb-3">
                <h1 id="hero-heading" className="text-sm font-bold tracking-[0.15em] uppercase">
                  Selected Work
                </h1>
                <p className="mt-2 max-w-[34rem] text-[0.96rem] leading-[1.55] text-black/50">
                  {bio}
                </p>
              </section>

              <section className="flex flex-col gap-12" aria-label={`${name} projects`}>
                {homeProjects.map((project, index) => {
                  const cover = project.cover_image
                    ? urlFor(project.cover_image).width(1600).auto("format").url()
                    : null;

                  const asset = project.cover_image?.asset;
                  const resolvedAsset = asset && "_id" in asset ? asset : null;
                  const blurUrl = resolvedAsset?.metadata?.lqip ?? null;

                  return (
                    <Link
                      key={project._id}
                      href={`/project/${project.slug.current}`}
                      className="flex flex-col gap-2"
                      aria-label={project.title}
                    >
                      {cover && (
                        <div className="w-full overflow-hidden bg-black/[0.03]">
                          <Image
                            src={cover}
                            alt={project.cover_image?.alt ?? project.title}
                            width={1600}
                            height={1100}
                            className="h-auto w-full"
                            sizes="(max-width: 899px) 100vw, min(1040px, 78vw)"
                            priority={index === 0}
                            placeholder={blurUrl ? "blur" : "empty"}
                            blurDataURL={blurUrl ?? undefined}
                          />
                        </div>
                      )}
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
