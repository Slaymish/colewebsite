import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import {
  getProjectBySlug,
  getAllPublishedProjects,
  getAllProjectSlugs,
  getSiteSettings,
} from '../../../lib/queries'
import { urlFor } from '../../../lib/sanity'
import { projectJsonLd } from '../../../lib/structured-data'
import Header from '../../../components/Header'
import ProjectSidebar from '../../../components/ProjectSidebar'
import SectionRenderer from '../../../components/SectionRenderer'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://coleanderson.com'
  const ogImageUrl = project.og_image?.asset
    ? urlFor(project.og_image).width(1200).height(630).auto('format').url()
    : project.cover_image?.asset
      ? urlFor(project.cover_image).width(1200).height(630).auto('format').url()
      : undefined

  return {
    title: project.title,
    description: project.meta_description,
    openGraph: {
      title: `Cole Anderson — ${project.title}`,
      description: project.meta_description,
      url: `${SITE_URL}/project/${slug}`,
      type: 'article',
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
      card: 'summary_large_image',
      title: `Cole Anderson — ${project.title}`,
      description: project.meta_description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
    alternates: {
      canonical: `${SITE_URL}/project/${slug}`,
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params

  const [project, projects, settings] = await Promise.all([
    getProjectBySlug(slug),
    getAllPublishedProjects(),
    getSiteSettings(),
  ])

  if (!project) notFound()

  const coverUrl = project.cover_image?.asset
    ? urlFor(project.cover_image).width(1400).auto('format').url()
    : null

  const coverThumb = project.cover_image?.asset
    ? urlFor(project.cover_image).width(40).blur(10).url()
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd(project, settings)),
        }}
      />

      <Header settings={settings} />

      <div className="flex min-h-[calc(100vh-57px)] flex-col md:flex-row">
        {/* Left: sticky project sidebar */}
        <ProjectSidebar projects={projects} activeSlug={slug} />

        {/* Right: project detail */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          aria-label={project.title}
        >
          {/* Cover image */}
          {coverUrl && (
            <div className="relative bg-neutral-100" style={{ aspectRatio: '16/9' }}>
              <Image
                src={coverUrl}
                alt={project.cover_image?.alt ?? project.title}
                fill
                className="object-cover"
                priority
                placeholder={coverThumb ? 'blur' : 'empty'}
                blurDataURL={coverThumb ?? undefined}
                sizes="(max-width: 768px) 100vw, calc(100vw - 320px)"
              />
            </div>
          )}

          {/* Project header */}
          <div className="px-8 py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                  {project.title}
                </h1>
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-200 px-3 py-0.5 text-xs text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {project.created_at && (
                <time
                  dateTime={project.created_at}
                  className="text-sm text-neutral-400"
                >
                  {new Date(project.created_at).toLocaleDateString('en-NZ', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </time>
              )}
            </div>
            {project.meta_description && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
                {project.meta_description}
              </p>
            )}
          </div>

          <hr className="border-neutral-100" />

          {/* Project sections */}
          {project.sections && project.sections.length > 0 && (
            <SectionRenderer sections={project.sections} />
          )}

          <div className="h-20" aria-hidden="true" />
        </main>
      </div>
    </>
  )
}
