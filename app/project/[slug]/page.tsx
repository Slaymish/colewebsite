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

      <div className="site-shell">
        <Header settings={settings} projects={projects} activeSlug={slug} />

        <main
          id="main-content"
          className="site-main"
          aria-label={project.title}
        >
          <div className="content-column">
            <div className="project-page">
              {coverUrl && (
                <figure className="home-project-image">
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

              <div className="project-header">
                <h1 className="project-title">{project.title}</h1>

                <div className="project-meta-row">
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
                    <div className="project-tags" aria-label="Tags">
                      {project.tags.map((tag) => (
                        <span key={tag} className="project-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {project.meta_description && (
                  <p className="project-description">
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
