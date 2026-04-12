import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  getProjectBySlug,
  getAllPublishedProjects,
  getAllProjectSlugs,
  getSiteSettings,
} from "../../../lib/queries";
import { urlFor } from "../../../lib/sanity";
import { projectJsonLd } from "../../../lib/structured-data";
import BackToTopButton from "../../../components/BackToTopButton";
import ProjectFooterNav from "../../../components/ProjectFooterNav";
import ProjectShell from "../../../components/ProjectShell";
import SectionRenderer from "../../../components/SectionRenderer";
import FreeObjectRenderer from "../../../components/FreeObjectRenderer";

export const revalidate = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://coleanderson.com";
  const ogImageUrl = project.og_image?.asset
    ? urlFor(project.og_image).width(1200).height(630).auto("format").url()
    : project.cover_image?.asset
      ? urlFor(project.cover_image).width(1200).height(630).auto("format").url()
      : undefined;

  return {
    title: project.title,
    description: project.meta_description,
    openGraph: {
      title: `Cole Anderson — ${project.title}`,
      description: project.meta_description,
      url: `${SITE_URL}/project/${slug}`,
      type: "article",
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: project.og_image?.alt ?? project.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `Cole Anderson — ${project.title}`,
      description: project.meta_description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
    alternates: {
      canonical: `${SITE_URL}/project/${slug}`,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  const [project, projects, settings] = await Promise.all([
    getProjectBySlug(slug),
    getAllPublishedProjects(),
    getSiteSettings(),
  ]);

  if (!project) notFound();

  const coverUrl = project.cover_image?.asset
    ? urlFor(project.cover_image).width(1400).auto("format").url()
    : null;

  const coverThumb = project.cover_image?.asset
    ? urlFor(project.cover_image).width(40).blur(10).url()
    : null;

  const hasBody =
    (project.sections?.length ?? 0) > 0 ||
    (project.freeObjects?.length ?? 0) > 0;

  const mainContent = (
    <main
      id="main-content"
      className="min-w-0 md:flex"
      aria-label={project.title}
    >
      <div className="relative w-full max-w-[1040px] mx-auto px-5 py-6 pb-16 md:px-10 md:py-8 md:pb-20 xl:px-12">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="w-fit text-[0.9rem] text-black/45 transition hover:text-black/80"
          >
            ← Back to home
          </Link>

          {coverUrl && (
            <figure className="-mx-5 w-[calc(100%+2.5rem)] max-w-none overflow-hidden bg-black/5 md:-mx-10 md:w-[calc(100%+5rem)] xl:-mx-12 xl:w-[calc(100%+6rem)]">
              <Image
                src={coverUrl}
                alt={project.cover_image?.alt ?? project.title}
                width={1400}
                height={875}
                className="h-auto w-full"
                priority
                placeholder={coverThumb ? "blur" : "empty"}
                blurDataURL={coverThumb ?? undefined}
                sizes="(max-width: 899px) 100vw, min(1040px, 78vw)"
              />
            </figure>
          )}

          <div className="flex flex-col gap-3 pb-1">
            <h1 className="text-[clamp(1.2rem,2vw,1.55rem)] font-medium leading-[1.2] tracking-[-0.02em]">
              {project.title}
            </h1>
          </div>

          {hasBody ? (
            <div
              className={`relative${project.freeObjects?.length ? " md:min-h-[500px]" : ""}`}
            >
              {project.sections && project.sections.length > 0 && (
                <SectionRenderer sections={project.sections} />
              )}
              {project.freeObjects && project.freeObjects.length > 0 && (
                <FreeObjectRenderer freeObjects={project.freeObjects} />
              )}
            </div>
          ) : null}

          <ProjectFooterNav
            projects={projects}
            currentSlug={slug}
            createdAt={project.created_at}
          />
        </div>
        <BackToTopButton />
      </div>
    </main>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd(project, settings)).replace(/</g, '\\u003c'),
        }}
      />

      <ProjectShell
        settings={settings}
        projects={projects}
        activeSlug={slug}
      >
        {mainContent}
      </ProjectShell>
    </>
  );
}
