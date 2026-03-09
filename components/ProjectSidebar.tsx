import type { ProjectSummary } from '../types'
import ProjectCard from './ProjectCard'

interface ProjectSidebarProps {
  projects: ProjectSummary[]
  activeSlug?: string
}

export default function ProjectSidebar({ projects, activeSlug }: ProjectSidebarProps) {
  return (
    <aside
      className="w-full border-r border-neutral-200 md:w-72 lg:w-80 xl:w-96"
      aria-label="Project list"
    >
      <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
        {projects.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-400">No projects yet.</p>
        ) : (
          <nav aria-label="Projects">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                isActive={project.slug.current === activeSlug}
              />
            ))}
          </nav>
        )}
      </div>
    </aside>
  )
}
