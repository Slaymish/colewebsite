import type { ProjectSummary } from "../types";
import ProjectCard from "./ProjectCard";

interface ProjectSidebarProps {
  projects: ProjectSummary[];
  activeSlug?: string;
}

/**
 * This is used to display a list of projects in a sidebar.
 * @param param0
 * @returns
 */
export default function ProjectSidebar({
  projects,
  activeSlug,
}: ProjectSidebarProps) {
  return (
    <aside className="w-full max-w-sm" aria-label="Project list">
      <div className="max-h-80 overflow-y-auto md:max-h-none">
        {projects.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-400">No projects yet.</p>
        ) : (
          <nav aria-label="Projects" className="space-y-1">
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
  );
}
