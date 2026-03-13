import type { Metadata } from "next";
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
import Header from "../../../components/Header";
import SectionRenderer from "../../../components/SectionRenderer";

export const revalidate = 60;

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd(project, settings)),
        }}
      />

      <div className="min-h-screen md:grid md:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)]">
        <Header settings={settings} projects={projects} activeSlug={slug} />

        <main
          id="main-content"
          className="min-w-0 md:flex"
          aria-label={project.title}
        >
          <div className="w-full max-w-[1040px] px-5 py-6 pb-16 md:px-10 md:py-8 md:pb-20 xl:px-12">
            <div className="flex flex-col gap-6">
              {coverUrl && (
                <figure className="w-full overflow-hidden rounded-2xl bg-black/5">
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

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.82rem] text-black/50">
                  {project.created_at && (
                    <time dateTime={project.created_at}>
                      {new Date(project.created_at).toLocaleDateString(
                        "en-NZ",
                        {
                          year: "numeric",
                          month: "long",
                        },
                      )}
                    </time>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div
                      className="flex flex-wrap gap-x-3 gap-y-1"
                      aria-label="Tags"
                    >
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[0.82rem] text-black/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {project.meta_description && (
                  <p className="max-w-[42rem] text-[0.96rem] leading-[1.6] text-black/65">
                    {project.meta_description}
                  </p>
                )}
              </div>

              {project.sections && project.sections.length > 0 && (
                <SectionRenderer sections={project.sections} />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
