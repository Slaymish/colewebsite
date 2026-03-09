import Link from 'next/link'
import Image from 'next/image'
import type { ProjectSummary } from '../types'
import { urlFor } from '../lib/sanity'

interface ProjectCardProps {
  project: ProjectSummary
  isActive?: boolean
}

export default function ProjectCard({ project, isActive = false }: ProjectCardProps) {
  const slug = project.slug.current
  const coverUrl = project.cover_image
    ? urlFor(project.cover_image).width(800).height(600).auto('format').url()
    : null

  return (
    <Link
      href={`/project/${slug}`}
      className={`group block border-b border-neutral-100 py-4 px-4 transition-colors hover:bg-neutral-50 ${
        isActive ? 'bg-neutral-50' : ''
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {coverUrl && (
        <div className="mb-3 overflow-hidden rounded-sm bg-neutral-100 aspect-[4/3]">
          <Image
            src={coverUrl}
            alt={project.cover_image?.alt ?? project.title}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 280px"
            loading="lazy"
          />
        </div>
      )}
      <h2 className="text-sm font-medium leading-snug">{project.title}</h2>
      {project.tags && project.tags.length > 0 && (
        <p className="mt-1 text-xs text-neutral-400">{project.tags.join(', ')}</p>
      )}
      {project.created_at && (
        <p className="mt-1 text-xs text-neutral-400">
          {new Date(project.created_at).getFullYear()}
        </p>
      )}
    </Link>
  )
}
